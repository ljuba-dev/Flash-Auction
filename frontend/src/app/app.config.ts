import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import {AuthInterceptorService} from './middleware/authInterceptor/auth-interceptor.service';
import {BASE_URL, WEBSOCKET_URL} from './api.routes';

const config: SocketIoConfig = { url:
BASE_URL, options: {
  autoConnect: false,
  path: WEBSOCKET_URL,
  auth: {token: localStorage.getItem('token')},
  // extraHeaders:{
  //   'Authorization': 'Bearer ' + localStorage.getItem('token')
  // },
  withCredentials: true
} };

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),  provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true},
    importProvidersFrom(SocketIoModule.forRoot(config))

  ]
};
