import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {shareReplay} from 'rxjs';
import {API_URL_AUTH} from '../../api.routes';
import {WsService} from '../ws/ws.service';
import {LoginRequest} from '../../interfaces/login-request';



@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private http: HttpClient,
              private wsService: WsService) { }
  login(email:string, password:string) {
    return this.http.post<LoginRequest>(API_URL_AUTH, {email, password})
      // this is just the HTTP call,
      // we still need to handle the reception of the token
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }));
  }
  isAuthenticated() {
    const hasToken = !!localStorage.getItem('token');

    if(hasToken && !this.wsService.isConnected()) {
      this.wsService.connect();
    }
    return hasToken;
  }
}
