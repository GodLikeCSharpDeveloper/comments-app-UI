import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { UserComment } from '../../common/models/UserComment';
import { CommonModule } from '@angular/common';
import { Lightbox, LightboxModule } from 'ngx-lightbox';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { CommentService } from '../../common/services/CommentService/CommentService';
import { CreateCommentDto } from '../../common/models/CreateCommentDto';
import { User } from '../../common/models/User';
import { CommentUtilityService } from '../../common/services/CommentUtility/CommentUtilityService';
import { Subscription, switchMap } from 'rxjs';
import { LazyLoadDirective } from '../../common/directives/lazyLoad.directive';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, LightboxModule, AddCommentComponent, LazyLoadDirective],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnChanges, OnDestroy {
  @Input() comment!: UserComment;
  @Output() reply = new EventEmitter<UserComment>();
  @Input() isReply: boolean = false;
  isReplying: boolean = false;
  currentQuote: string | null = null;
  subscriptions: Subscription = new Subscription();
  processedText: SafeHtml | null = null;
  imageUrl: SafeUrl | null = null;
  private objectUrl: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private lightbox: Lightbox,
    private cdr: ChangeDetectorRef,
    private commentService: CommentService,
    private commentUtilityService: CommentUtilityService
  ) {}
  initializeImage(image: File) {
    this.objectUrl = URL.createObjectURL(image);
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(this.objectUrl);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comment']) {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl);
        this.objectUrl = null;
      }

      if (this.comment.image) {
        this.objectUrl = URL.createObjectURL(this.comment.image);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(this.objectUrl);
      } else {
        this.imageUrl = null;
      }

      let cleanHtml = DOMPurify.sanitize(this.comment.text, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'blockquote', 'ul', 'ol', 'li', 'a'],
        ALLOWED_ATTR: ['href', 'title', 'target', 'class'],
      });
      cleanHtml = cleanHtml.replace(/<blockquote(?![^>]*class=")[^>]*>/gi, '<blockquote class="blockquote">');
      this.processedText = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
    }
  }
  loadImage(comment: UserComment) {
    if (comment.imageUrl) {
      this.subscriptions.add(
        this.commentService.getPreSignedUrl(comment.imageUrl).subscribe({
          next: async (response: string) => {
            if (comment.imageUrl) comment.image = await this.commentService.downloadFile(response, comment.imageUrl);
            if (comment.image) this.initializeImage(comment.image);
          },
        })
      );
    }
  }
  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.lightbox.close();
    this.subscriptions.unsubscribe();
  }

  toggleReply(): void {
    this.isReplying = !this.isReplying;
    this.cdr.detectChanges();
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
            console.log(lastCommentId);
            this.comment.replies.push(comment);
          },
          error: error => {
            console.error('Error adding comment:', error);
          },
        })
    );
  }

  onReplyAdded(reply: UserComment): void {
    this.isReplying = false;
    this.reply.emit(reply);
  }

  openImageLightbox(): void {
    if (this.comment.image && this.objectUrl) {
      const album = [
        {
          src: this.objectUrl,
          caption: 'Image',
          thumb: this.objectUrl,
        },
      ];
      this.lightbox.open(album, 0);
    }
  }
}
