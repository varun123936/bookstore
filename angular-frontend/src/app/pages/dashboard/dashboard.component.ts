import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';
import { Book } from '../../models/book.model';
import { LibraryApiService } from '../../services/library-api.service';
import { extractErrorMessage } from '../../shared/utils/display.utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private readonly api = inject(LibraryApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly colorPalette = ['#ff6384', '#38aecc', '#ffd700', '#4caf50', '#9c27b0', '#ff8a65'];

  @ViewChild('booksBarCanvas')
  private booksBarCanvas?: ElementRef<HTMLCanvasElement>;

  @ViewChild('booksPieCanvas')
  private booksPieCanvas?: ElementRef<HTMLCanvasElement>;

  books: Book[] = [];
  errorMessage = '';
  isLoading = true;
  totalPages = 0;
  uniqueAuthors = 0;
  averagePages = 0;

  private barChart?: Chart;
  private pieChart?: Chart;
  private viewReady = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.destroyCharts());
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderCharts();
  }

  private loadBooks(): void {
    this.isLoading = true;

    this.api.getBooks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ books }) => {
          this.books = books;
          this.updateSummary();
          this.errorMessage = '';
          this.isLoading = false;
          queueMicrotask(() => this.renderCharts());
        },
        error: (error: unknown) => {
          this.books = [];
          this.updateSummary();
          this.errorMessage = extractErrorMessage(error, 'Unable to load dashboard data.');
          this.isLoading = false;
          this.destroyCharts();
        }
      });
  }

  private updateSummary(): void {
    this.totalPages = this.books.reduce((sum, book) => sum + Number(book.pages || 0), 0);
    this.uniqueAuthors = new Set(this.books.map((book) => book.name)).size;
    this.averagePages = this.books.length > 0 ? Math.round(this.totalPages / this.books.length) : 0;
  }

  private renderCharts(): void {
    if (!this.viewReady || !this.booksBarCanvas || !this.booksPieCanvas || this.books.length === 0) {
      this.destroyCharts();
      return;
    }

    this.destroyCharts();

    const labels = this.books.map((book) => book.title);
    const pageData = this.books.map((book) => Number(book.pages || 0));
    const barColors = this.buildColors(pageData.length);
    const authorCounts = this.buildAuthorCounts();
    const pieLabels = Array.from(authorCounts.keys());
    const pieData = Array.from(authorCounts.values());
    const pieColors = this.buildColors(pieData.length);

    this.barChart = new Chart(this.booksBarCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Pages',
            data: pageData,
            backgroundColor: barColors,
            borderColor: barColors,
            borderWidth: 1,
            borderRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Book Length Distribution'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(...pageData, 700),
            ticks: {
              stepSize: 50
            }
          }
        }
      }
    });

    this.pieChart = new Chart(this.booksPieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [
          {
            label: 'Book Count',
            data: pieData,
            backgroundColor: pieColors,
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Books Per Author'
          }
        }
      }
    });
  }

  private buildAuthorCounts(): Map<string, number> {
    return this.books.reduce((counts, book) => {
      counts.set(book.name, (counts.get(book.name) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
  }

  private buildColors(count: number): string[] {
    return Array.from({ length: count }, (_, index) => this.colorPalette[index % this.colorPalette.length]);
  }

  private destroyCharts(): void {
    this.barChart?.destroy();
    this.pieChart?.destroy();
    this.barChart = undefined;
    this.pieChart = undefined;
  }
}
