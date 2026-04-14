import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {AuthService} from './services/auth/auth.service';
import {ToastComponent} from './components/toast/toast/toast.component';
import {WsService} from './services/ws/ws.service';
import {WsHandlers} from './services/ws/ws.handlers';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService, private router: Router, private wsHandlerService: WsHandlers, private wsService: WsService) {}
  isAuthenticated() {
     return this.authService.isAuthenticated();
   }
  logout() {
     localStorage.removeItem('token');
     this.wsService.disconnect();
     this.router.navigateByUrl('/');
   }
   ngOnInit() {
    if(this.isAuthenticated()) {
      this.wsHandlerService.startHandling();
    }
   }

  ngOnDestroy(){
    this.wsHandlerService.stopHandling();
  }
}
