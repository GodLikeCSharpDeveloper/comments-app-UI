import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../../app.component';

declare const grecaptcha: any;

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  private siteKey = '6Le7NXYqAAAAAED9bA7fMzT9BMMQHJfyjccTFbXK';
  constructor(private http: HttpClient) {}

  VerifyCaptcha(action: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        (grecaptcha.execute(this.siteKey, { action }) as Promise<string>)
          .then(token =>
            this.http
              .post<boolean>(`${apiUrl}/verify?token=${token}`, null)
              .subscribe({ next: (result: boolean) => resolve(result) })
          )
          .catch(error => reject(error));
      });
    });
  }
}
