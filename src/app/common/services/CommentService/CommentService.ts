import { Injectable } from '@angular/core';
import { UserComment } from '../../models/UserComment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'https://localhost:8081/comments';
  constructor(private http: HttpClient) {}
  uploadComment(comment: UserComment) {
    const formData = new FormData();

    formData.append('id', comment.id?.toString());
    formData.append('text', comment.text);
    formData.append('createdAt', comment.createdAt?.toISOString());
    formData.append('captcha', comment.captcha);
    formData.append('userId', comment.user.id?.toString());
    formData.append('parentCommentId', comment.parentCommentId ? comment.parentCommentId?.toString() : '');
    if (comment.textFile) formData.append('textFile', comment.textFile);
    if (comment.image) formData.append('image', comment.image);

    return this.http.post(`${this.apiUrl}`, formData).pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse) {
    console.error('Error:', error);
    return throwError(() => error);
  }
}
