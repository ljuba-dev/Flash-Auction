import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {shareReplay} from 'rxjs';
import {API_URL_AUTH} from '../../api.routes';


interface User {
  email: string;
  token: string;
}


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient) { }
  login(email:string, password:string) {
    return this.http.post<User>(API_URL_AUTH, {email, password})
      // this is just the HTTP call,
      // we still need to handle the reception of the token
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }));
  }
}
