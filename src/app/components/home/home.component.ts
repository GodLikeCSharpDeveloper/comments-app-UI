import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { UserComment } from '../../common/models/UserComment';
import { User } from '../../common/models/User';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../common/services/CommentService/CommentService';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  title = 'comments-app-UI';
  displayedColumns: string[] = ['userName', 'email', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<UserComment>();
  comments: UserComment[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.dataSource.data = Array.from({ length: 100 }, (_, i) => {
      const index = i + 1;
      return new UserComment(
        `Комментарий ${index}`,
        `captcha${index}`,
        new User(`User${index}`, `user${index}@example.com`),
        new Date(),
        undefined,
        undefined,
        undefined,
        [
          new UserComment(
            `Ответ на комментарий ${index}-1`,
            `captcha${index}-1`,
            new User(`ReplyUser${index}-1`, `reply${index}-1@example.com`),
            new Date()
          ),
          new UserComment(
            `Ответ на комментарий ${index}-2`,
            `captcha${index}-2`,
            new User(`ReplyUser${index}-2`, `reply${index}-2@example.com`),
            new Date()
          ),
        ]
      );
    });
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'userName':
          return item.user.userName;
        case 'email':
          return item.user.email;
        case 'createdAt':
          return item.createdAt.toString();
        default:
          return '';
      }
    };
  }
  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.onPageChange();
    });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  
  onPageChange(): void {
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    this.commentService
      .loadComments(pageIndex, pageSize)
      .pipe(finalize(() => (this.dataSource.paginator = this.paginator)))
      .subscribe({
        next: (comments: UserComment[]) => {
          this.dataSource.data = comments;
        },
        error: (error) => {
          console.error('Error loading comments:', error);
        },
      });
  }
  
}
