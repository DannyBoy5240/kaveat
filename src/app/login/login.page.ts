import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  // userName: string;
  // userPassword: string;
  userForm = this.formBuilder.group({
    userName: ['', [Validators.required, Validators.minLength(2)]],
    userPassword: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(public authService: AuthService, private route: Router, public formBuilder: FormBuilder) { }

  ngOnInit() {
  }

  redirectLanding() {
    this.route.navigate(['landing']);
  }

  submitForm() {
    this.authService.signIn(this.userForm.get('userName').value, this.userForm.get('userPassword').value);
  }

}
