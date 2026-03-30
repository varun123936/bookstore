import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Author, AuthorPayload } from '../../models/author.model';
import { LibraryApiService } from '../../services/library-api.service';
import { ModalShellComponent } from '../../shared/components/modal-shell/modal-shell.component';
import { extractErrorMessage, formatDateOnly, formatDateTime, toDateInputValue } from '../../shared/utils/display.utils';

type AlertType = 'success' | 'error';

@Component({
  selector: 'app-authors-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ModalShellComponent],
  templateUrl: './authors-page.component.html'
})
export class AuthorsPageComponent implements OnInit {
  private readonly api = inject(LibraryApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly formatDateOnly = formatDateOnly;
  readonly formatDateTime = formatDateTime;
  readonly authorForm = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control(''),
    birthday: this.formBuilder.nonNullable.control(''),
    bio: this.formBuilder.nonNullable.control('')
  });

  authors: Author[] = [];
  selectedAuthor: Author | null = null;
  isLoading = true;
  isAuthorEditorOpen = false;
  isAuthorViewOpen = false;
  isAuthorDeleteOpen = false;
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
    this.loadAuthors();
  }

  trackByAuthorId(_: number, author: Author): number {
    return author.id;
  }

  openAddAuthorModal(): void {
    this.isEditMode = false;
    this.selectedAuthor = null;
    this.resetAuthorForm();
    this.isAuthorEditorOpen = true;
  }

  openEditAuthorModal(author: Author): void {
    this.isEditMode = true;
    this.selectedAuthor = author;
    this.resetAuthorForm(author);
    this.isAuthorEditorOpen = true;
  }

  openViewAuthorModal(author: Author): void {
    this.selectedAuthor = author;
    this.isAuthorViewOpen = true;
  }

  openDeleteAuthorModal(author: Author): void {
    this.selectedAuthor = author;
    this.isAuthorDeleteOpen = true;
  }

  closeAuthorEditor(): void {
    this.isAuthorEditorOpen = false;
    this.resetAuthorForm();
  }

  closeAuthorView(): void {
    this.isAuthorViewOpen = false;
  }

  closeAuthorDelete(): void {
    this.isAuthorDeleteOpen = false;
  }

  saveAuthor(): void {
    const payload: AuthorPayload = this.authorForm.getRawValue();
    const request$ = this.isEditMode && this.selectedAuthor
      ? this.api.updateAuthor(this.selectedAuthor.id, payload)
      : this.api.createAuthor(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ authors, message }) => {
          this.authors = authors;
          this.closeAuthorEditor();
          this.showAlert('success', message ?? 'Author saved successfully.');
        },
        error: (error: unknown) => {
          this.showAlert('error', extractErrorMessage(error, 'Unable to save the author.'));
        }
      });
  }

  confirmDeleteAuthor(): void {
    if (!this.selectedAuthor) {
      return;
    }

    this.api.deleteAuthor(this.selectedAuthor.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ authors, message }) => {
          this.authors = authors;
          this.closeAuthorDelete();
          this.showAlert('success', message ?? 'Author deleted successfully.');
        },
        error: (error: unknown) => {
          this.showAlert('error', extractErrorMessage(error, 'Unable to delete the author.'));
        }
      });
  }

  private loadAuthors(): void {
    this.isLoading = true;

    this.api.getAuthors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ authors }) => {
          this.authors = authors;
          this.isLoading = false;
        },
        error: (error: unknown) => {
          this.isLoading = false;
          this.showAlert('error', extractErrorMessage(error, 'Unable to load authors.'));
        }
      });
  }

  private resetAuthorForm(author?: Author): void {
    this.authorForm.reset({
      name: author?.name ?? '',
      birthday: toDateInputValue(author?.birthday),
      bio: author?.bio ?? ''
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
