export interface Author {
  id: number;
  name: string;
  birthday: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorPayload {
  name: string;
  birthday: string;
  bio: string;
}

export interface AuthorsResponse {
  authors: Author[];
  message?: string;
}
