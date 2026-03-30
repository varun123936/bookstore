import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthorPayload, AuthorsResponse } from '../models/author.model';
import { BookPayload, BooksResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class LibraryApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAuthors(): Observable<AuthorsResponse> {
    return this.http.get<AuthorsResponse>(`${this.apiUrl}/authors`);
  }

  createAuthor(payload: AuthorPayload): Observable<AuthorsResponse> {
    return this.http.post<AuthorsResponse>(`${this.apiUrl}/authors`, payload);
  }

  updateAuthor(id: number, payload: AuthorPayload): Observable<AuthorsResponse> {
    return this.http.put<AuthorsResponse>(`${this.apiUrl}/authors/${id}`, payload);
  }

  deleteAuthor(id: number): Observable<AuthorsResponse> {
    return this.http.delete<AuthorsResponse>(`${this.apiUrl}/authors/${id}`);
  }

  getBooks(): Observable<BooksResponse> {
    return this.http.get<BooksResponse>(`${this.apiUrl}/books`);
  }

  createBook(payload: BookPayload): Observable<BooksResponse> {
    return this.http.post<BooksResponse>(`${this.apiUrl}/books`, payload);
  }

  updateBook(id: number, payload: BookPayload): Observable<BooksResponse> {
    return this.http.put<BooksResponse>(`${this.apiUrl}/books/${id}`, payload);
  }

  deleteBook(id: number): Observable<BooksResponse> {
    return this.http.delete<BooksResponse>(`${this.apiUrl}/books/${id}`);
  }
}
