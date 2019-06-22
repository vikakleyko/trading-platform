import { Component, OnInit } from '@angular/core';
import {AuthService} from '../service/auth.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitted  =  false;
  loginInvalid = false;

  constructor(private authService: AuthService,
              private router: Router,
              private formBuilder: FormBuilder ) { }

  ngOnInit() {
    this.authService.logout();
    this.loginForm  =  this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get formControls() { return this.loginForm.controls; }

  login() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
        return;
    }
    if (this.loginForm.value.username === environment.username && this.loginForm.value.password === environment.password) {
      this.authService.login(this.loginForm.value);
      this.router.navigateByUrl('/platform');
    } else {
      this.loginInvalid = true;
    }
  }
}
