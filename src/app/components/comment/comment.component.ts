import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { UserComment } from '../../common/models/UserComment';
import { CommonModule } from '@angular/common';
import { Lightbox, LightboxModule } from 'ngx-lightbox';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, LightboxModule],
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

  constructor(private sanitizer: DomSanitizer, private lightbox: Lightbox) {}

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

      const cleanHtml = DOMPurify.sanitize(this.comment.text, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'blockquote', 'ul', 'ol', 'li', 'a'],
        ALLOWED_ATTR: ['href', 'title', 'target']
      });
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
