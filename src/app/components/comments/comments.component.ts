import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../common/models/User';
import { UserComment } from '../../common/models/UserComment';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { CommentComponent } from '../comment/comment.component';
import { CommentService } from '../../common/services/CommentService/CommentService';
import { Subscription, switchMap } from 'rxjs';
import { CreateCommentDto } from '../../common/models/CreateCommentDto';
import { CommentUtilityService } from '../../common/services/CommentUtility/CommentUtilityService';
import { LazyLoadDirective } from '../../common/directives/lazyLoad.directive';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCommentComponent, CommentComponent, LazyLoadDirective],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit, OnDestroy {
  comments: UserComment[] = [];
  subscriptions: Subscription = new Subscription();
  constructor(private commentService: CommentService, private commentUtilityService: CommentUtilityService) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngOnInit(): void {
    this.subscriptions.add(
      this.commentService.loadAllComments().subscribe({
        next: (comments: UserComment[]) => {
          this.comments = comments;
        },
        error: error => {
          console.error('Error loading comments:', error);
        },
      })
    );
  }

  addComment(newComment: CreateCommentDto): void {
    this.subscriptions.add(
      this.commentService
        .uploadComment(newComment)
        .pipe(switchMap(() => this.commentService.getLastCommentAddedId(newComment.email)))
        .subscribe({
          next: (lastCommentId: any) => {
            const comment = this.commentUtilityService.convertCreateCommentDtoToComment(newComment);
            comment.parentCommentId = lastCommentId;
            this.comments.push(comment);
          },
          error: error => {
            console.error('Error adding comment:', error);
          },
        })
    );
  }

  addReply(parentComment: UserComment, reply: UserComment): void {
    if (!parentComment.replies) {
      parentComment.replies = [];
    }
    parentComment.replies.unshift(reply);
  }
}
