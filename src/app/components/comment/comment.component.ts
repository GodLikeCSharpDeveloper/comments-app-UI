import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { UserComment } from '../../common/models/UserComment';
import { CommonModule } from '@angular/common';
import { Lightbox, LightboxModule } from 'ngx-lightbox';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { AddCommentComponent } from "../add-comment/add-comment.component";
import { CommentService } from '../../common/services/CommentService/CommentService';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, LightboxModule, AddCommentComponent],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnChanges, OnDestroy {
  @Input() comment!: UserComment;
  @Output() reply = new EventEmitter<UserComment>();
  @Input() isReply: boolean = false;
  isReplying: boolean = false;
  currentQuote: string | null = null;

  processedText: SafeHtml | null = null;
  imageUrl: SafeUrl | null = null;
  private objectUrl: string | null = null;

  constructor(private sanitizer: DomSanitizer, private lightbox: Lightbox, private cdr: ChangeDetectorRef, private commentService: CommentService) {}

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
        ALLOWED_ATTR: ['href', 'title', 'target', 'class']
      });
      cleanHtml = cleanHtml.replace(/<blockquote(?![^>]*class=")[^>]*>/gi, '<blockquote class="blockquote">');
      this.processedText = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
      console.log(this.processedText);
    }
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.lightbox.close();
  }

  toggleReply(): void {
    this.isReplying = !this.isReplying;
    this.cdr.detectChanges();

  }
  addComment(newComment: UserComment): void {
    this.commentService.uploadComment(newComment);
    this.comment.replies.push(newComment);
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
