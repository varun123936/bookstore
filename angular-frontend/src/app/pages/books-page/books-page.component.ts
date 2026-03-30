import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Author } from '../../models/author.model';
import { Book, BookPayload } from '../../models/book.model';
import { LibraryApiService } from '../../services/library-api.service';
import { ModalShellComponent } from '../../shared/components/modal-shell/modal-shell.component';
import { extractErrorMessage, formatDateOnly, formatDateTime, toDateInputValue } from '../../shared/utils/display.utils';

type AlertType = 'success' | 'error';

@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ModalShellComponent],
  templateUrl: './books-page.component.html'
})
export class BooksPageComponent implements OnInit {
  private readonly api = inject(LibraryApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly formatDateOnly = formatDateOnly;
  readonly formatDateTime = formatDateTime;
  readonly bookForm = this.formBuilder.group({
    title: this.formBuilder.nonNullable.control(''),
    releaseDate: this.formBuilder.nonNullable.control(''),
    description: this.formBuilder.nonNullable.control(''),
    pages: this.formBuilder.nonNullable.control(0),
    author: this.formBuilder.nonNullable.control(0)
  });

  books: Book[] = [];
  authors: Author[] = [];
  selectedBook: Book | null = null;
  isLoading = true;
  isBookEditorOpen = false;
  isBookViewOpen = false;
  isBookDeleteOpen = false;
  isEditMode = false;
  message = '';
  alertType: AlertType | null = null;

  private alertTimeoutId?: number;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.alertTimeoutId) {
        window.clearTimeout(this.alertTimeoutId);
      }
    });
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  trackByBookId(_: number, book: Book): number {
    return book.id;
  }

  openAddBookModal(): void {
    if (!this.authors.length) {
      this.showAlert('error', 'Create an author before adding a book.');
      return;
    }

    this.isEditMode = false;
    this.selectedBook = null;
    this.resetBookForm();
    this.isBookEditorOpen = true;
  }

  openEditBookModal(book: Book): void {
    this.isEditMode = true;
    this.selectedBook = book;
    this.resetBookForm(book);
    this.isBookEditorOpen = true;
  }

  openViewBookModal(book: Book): void {
    this.selectedBook = book;
    this.isBookViewOpen = true;
  }

  openDeleteBookModal(book: Book): void {
    this.selectedBook = book;
    this.isBookDeleteOpen = true;
  }

  closeBookEditor(): void {
    this.isBookEditorOpen = false;
    this.resetBookForm();
  }

  closeBookView(): void {
    this.isBookViewOpen = false;
  }

  closeBookDelete(): void {
    this.isBookDeleteOpen = false;
  }

  saveBook(): void {
    const payload: BookPayload = this.bookForm.getRawValue();

    if (!payload.author) {
      this.showAlert('error', 'Please choose an author for the book.');
      return;
    }

    const request$ = this.isEditMode && this.selectedBook
      ? this.api.updateBook(this.selectedBook.id, payload)
      : this.api.createBook(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ books, message }) => {
          this.books = books;
          this.closeBookEditor();
          this.showAlert('success', message ?? 'Book saved successfully.');
        },
        error: (error: unknown) => {
          this.showAlert('error', extractErrorMessage(error, 'Unable to save the book.'));
        }
      });
  }

  confirmDeleteBook(): void {
    if (!this.selectedBook) {
      return;
    }

    this.api.deleteBook(this.selectedBook.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ books, message }) => {
          this.books = books;
          this.closeBookDelete();
          this.showAlert('success', message ?? 'Book deleted successfully.');
        },
        error: (error: unknown) => {
          this.showAlert('error', extractErrorMessage(error, 'Unable to delete the book.'));
        }
      });
  }

  private loadPageData(): void {
    this.isLoading = true;

    forkJoin({
      booksResponse: this.api.getBooks(),
      authorsResponse: this.api.getAuthors()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ booksResponse, authorsResponse }) => {
          this.books = booksResponse.books;
          this.authors = authorsResponse.authors;
          this.isLoading = false;
        },
        error: (error: unknown) => {
          this.isLoading = false;
          this.showAlert('error', extractErrorMessage(error, 'Unable to load books and authors.'));
        }
      });
  }

  private resetBookForm(book?: Book): void {
    this.bookForm.reset({
      title: book?.title ?? '',
      releaseDate: toDateInputValue(book?.releaseDate),
      description: book?.description ?? '',
      pages: book?.pages ?? 0,
      author: book?.authorId ?? this.authors[0]?.id ?? 0
    });
  }

  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.message = message;

    if (this.alertTimeoutId) {
      window.clearTimeout(this.alertTimeoutId);
    }

    this.alertTimeoutId = window.setTimeout(() => {
      this.alertType = null;
      this.message = '';
    }, 5000);
  }
}
