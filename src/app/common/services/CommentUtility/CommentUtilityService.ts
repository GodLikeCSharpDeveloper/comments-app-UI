import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Injectable } from '@angular/core';
import { CreateCommentDto } from '../../models/CreateCommentDto';
import { User } from '../../models/User';
import { UserComment } from '../../models/UserComment';
import DOMPurify from 'dompurify';
@Injectable({
  providedIn: 'root',
})
export class CommentUtilityService {
  constructor(private sanitizer: DomSanitizer) {}
  convertCreateCommentDtoToComment(commentDto: CreateCommentDto): UserComment {
    const user = new User(commentDto.userName, commentDto.email, commentDto.homePage);
    const comment = new UserComment(
      commentDto.text,
      user,
      new Date(),
      commentDto.image,
      commentDto.textFile,
      commentDto.parentComment
    );
    return comment;
  }
  private allowedTags: string[] = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'blockquote', 'ul', 'ol', 'li', 'a'];
  private allowedAttr: string[] = ['href', 'title', 'target', 'class'];
  sanitizeText(text: string | null | undefined): string {
    if (text) {
      const cleanText = DOMPurify.sanitize(text, {
        ALLOWED_TAGS: this.allowedTags,
        ALLOWED_ATTR: this.allowedAttr,
      });
      return cleanText;
    }
    return '';
  }
  addBlockquoteClassToCleanHtml(text: string): string {
    let cleanHtml = this.sanitizeText(text);
    cleanHtml = cleanHtml.replace(/<blockquote(?![^>]*class=")[^>]*>/gi, '<blockquote class="blockquote">');
    return cleanHtml;
  }
  validateFile(file: File, allowedTypes: string[], maxSizeInKB: number): { valid: boolean; error: string | null } {
    if (!file) {
      return { valid: false, error: 'You did not choose a file.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}.` };
    }

    const fileSizeInKB = file.size / 1024;
    if (fileSizeInKB > maxSizeInKB) {
      return { valid: false, error: `File size exceeds the limit of ${maxSizeInKB}KB.` };
    }

    return { valid: true, error: null };
  }
  
  initializeImageFromFile(image: File) : SafeUrl | null {
    const objectUrl = URL.createObjectURL(image);
    return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  }
}
