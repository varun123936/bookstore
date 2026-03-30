import { Routes } from '@angular/router';
import { AuthorsPageComponent } from './pages/authors-page/authors-page.component';
import { BooksPageComponent } from './pages/books-page/books-page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    title: 'Dashboard | Authors & Books'
  },
  {
    path: 'books',
    component: BooksPageComponent,
    title: 'Manage Books'
  },
  {
    path: 'authors',
    component: AuthorsPageComponent,
    title: 'Manage Authors'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found'
  }
];
