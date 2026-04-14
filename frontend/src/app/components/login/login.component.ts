import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';
import {WsHandlers} from '../../services/ws/ws.handlers';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form:FormGroup;

  constructor(private fb:FormBuilder,
              private authService: AuthService,
              private wsHandlerService: WsHandlers,
              private router: Router) {

    this.form = this.fb.group({
      email: ['',Validators.required],
      password: ['',Validators.required]
    });
  }

  login() {
    const val = this.form.value;
    if (val.email && val.password) {
      this.authService.login(val.email, val.password)
        .subscribe(
          (response) => {
            if(response.token)
            {

              localStorage.setItem('token', response.token);
              this.router.navigateByUrl('/items');
              setTimeout( () => {
                this.wsHandlerService.startHandling();
              }, 200);
            }
          }
        );
    }
  }
}
