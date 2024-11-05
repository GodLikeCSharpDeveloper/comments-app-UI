import { Injectable } from '@angular/core';
import { UserComment } from '../../models/UserComment';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { CreateCommentDto } from '../../models/CreateCommentDto';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'https://localhost:8081/comments';

  constructor(private http: HttpClient) {}

  uploadComment(comment: CreateCommentDto): Observable<void> {
    const formData = new FormData();
    formData.append('text', comment.text);
    formData.append('captcha', comment.captcha);
    formData.append('userName', comment.userName);
    formData.append('email', comment.email);
    formData.append('homePage', comment.homePage ? comment.homePage : '');
    if (comment.textFile) {
      formData.append('textFile', comment.textFile);
    }
    if (comment.image) {
      formData.append('image', comment.image);
    }
    if (comment.parentComment) {
      formData.append('parentCommentId', comment.parentComment.id.toString());
    }

    return this.http.post<void>(`${this.apiUrl}/post`, formData);
  }

  loadComments(
    pageNumber: number,
    pageSize: number,
    sortDirection: string,
    orderProperty: string
  ): Observable<UserComment[]> {
    return this.http.get<UserComment[]>(
      `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}&order=${sortDirection}&sortBy=${orderProperty}`
    );
  }
  loadAllComments(): Observable<UserComment[]> {
    return this.http.get<UserComment[]>(`${this.apiUrl}/all`);
  }
  countComments(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
  getPreSignedUrl(fileName: string): Observable<string> {
    const params = new HttpParams().set('filePath', fileName);
    return this.http.get(`${this.apiUrl}/fileUrl`, { params, responseType: 'text' });
  }
  async downloadFile(preSignedUrl: string, fileName: string): Promise<File> {
    try {
      const response = await fetch(preSignedUrl, {
        method: 'GET',
      });

      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });

      return file;
    } catch (error) {
      console.error('Error while downloading file:', error);
      throw error;
    }
  }
}
