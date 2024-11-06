import { Injectable } from '@angular/core';
import { UserComment } from '../../models/UserComment';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { CreateCommentDto } from '../../models/CreateCommentDto';
import { apiUrl } from '../../../app.component';

@Injectable({
  providedIn: 'root',
})
export class CommentService {

  private ngrokHeader = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true' // Значение может быть любым
  });

  constructor(private http: HttpClient) {}

  uploadComment(comment: CreateCommentDto): Observable<void> {
    const formData = new FormData();
    formData.append('text', comment.text);
    formData.append('userName', comment.userName);
    formData.append('email', comment.email);
    formData.append('homePage', comment.homePage ? comment.homePage : '');
    if (comment.textFile) {
      formData.append('textFile', comment.textFile);
    }
    if (comment.image) {
      formData.append('image', comment.image);
    }
    if (comment.parentComment?.id) {
      formData.append('parentCommentId', comment.parentComment.id.toString());
    }
    else if(comment.parentCommentId)
      formData.append('parentCommentId', comment.parentCommentId.toString());

    return this.http.post<void>(`${apiUrl}/post`, formData, { headers: this.ngrokHeader });
  }
  loadComments(
    pageNumber: number,
    pageSize: number,
    sortDirection: string,
    orderProperty: string
  ): Observable<UserComment[]> {
    return this.http.get<UserComment[]>(
      `${apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}&order=${sortDirection}&sortBy=${orderProperty}`,
      {headers: this.ngrokHeader}
    );
  }

  loadAllComments(): Observable<UserComment[]> {
    return this.http.get<UserComment[]>(`${apiUrl}/all`, { headers: this.ngrokHeader });
  }

  countComments(): Observable<number> {
    return this.http.get<number>(`${apiUrl}/count`, { headers: this.ngrokHeader });
  }

  getPreSignedUrl(fileName: string): Observable<string> {
    const params = new HttpParams().set('filePath', fileName);
    return this.http.get(`${apiUrl}/fileUrl`, { params, responseType: 'text', headers: this.ngrokHeader });
  }

  getLastCommentAddedId(email: string): Observable<number> {
    const params = new HttpParams().set('email', email);
    return this.http.get<number>(`${apiUrl}/lastComment`, { params, headers: this.ngrokHeader });
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
