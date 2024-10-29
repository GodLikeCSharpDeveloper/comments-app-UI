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
    formData.append('text', comment.text);
    formData.append('captcha', comment.captcha);
    formData.append('userName', comment.user.userName);
    formData.append('email', comment.user.email);
    formData.append('homePage', comment.user.homePage ? comment.user.homePage : '');
    if (comment.textFile) {
      formData.append('textFile', comment.textFile);
    }

    if (comment.image) {
      formData.append('image', comment.image);
    }

    if (comment.parentCommentId) {
      formData.append('parentCommentId', comment.parentCommentId.toString());
    }

    return this.http.post(this.apiUrl, formData).subscribe({
      next: response => {
        console.log('Commentary successfuly uploaded', response);
      },
      error: error => {
        console.error('Comment error while uploading', error);
      },
    });
  }
}
