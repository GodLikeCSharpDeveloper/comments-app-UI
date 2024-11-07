import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { UserComment } from '../../common/models/UserComment';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../common/services/CommentService/CommentService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'comments-app-UI';
  displayedColumns: string[] = ['userName', 'email', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<UserComment>();
  comments: UserComment[] = [];
  subscriptions: Subscription = new Subscription();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private commentService: CommentService) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
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
    this.sort.sortChange.subscribe(()=>{
      this.onPageChange();
    });
    this.dataSource.sort = this.sort;
    this.countComments();
    this.onPageChange();
  }

  onPageChange(): void {
    this.loadComments();
  }
  loadComments(): void {
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    this.subscriptions.add(
      this.commentService
        .loadComments(pageIndex, pageSize, this.sort.direction, this.sort.active)
        .subscribe({
          next: (comments: UserComment[]) => {
            this.dataSource.data = comments;
          },
          error: error => {
            console.error('Error loading comments:', error);
          },
        })
    );
  }
  countComments(): void {
    this.subscriptions.add(
      this.commentService
        .countComments()
        .subscribe({
          next: (length: number) => {
            this.paginator.length = length;
          },
          error: error => {
            console.error('Error loading comments:', error);
          },
        })
    );
  }
}
