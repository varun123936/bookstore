export interface Book {
  id: number;
  title: string;
  releaseDate: string;
  description: string;
  pages: number;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  name: string;
  birthday: string;
  bio: string;
}

export interface BookPayload {
  title: string;
  releaseDate: string;
  description: string;
  pages: number;
  author: number;
}

export interface BooksResponse {
  books: Book[];
  message?: string;
}
