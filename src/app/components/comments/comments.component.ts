import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../common/models/User';
import { UserComment } from '../../common/models/UserComment';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { CommentComponent } from "../comment/comment.component";
import { CommentService } from '../../common/services/CommentService/CommentService';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCommentComponent, CommentComponent],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {
  comments: UserComment[] = [];
  constructor(private commentService: CommentService){

  }
  ngOnInit(): void {
    this.comments = Array.from({ length: 1 }, (_, i) => {
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
            new Date(),
            undefined,
            undefined,
            undefined,
            []
          ),
          new UserComment(
            `Ответ на комментарий ${index}-2`,
            `captcha${index}-2`,
            new User(`ReplyUser${index}-2`, `reply${index}-2@example.com`),
            new Date(),
            undefined,
            undefined,
            undefined,
            []
          ),
        ]
      );
    });
  }

  addComment(newComment: UserComment): void {
    this.commentService.uploadComment(newComment);
    this.comments.push(newComment);
  }

  addReply(parentComment: UserComment, reply: UserComment): void {
    if (!parentComment.replies) {
      parentComment.replies = [];
    }
    parentComment.replies.unshift(reply);
  }
}
