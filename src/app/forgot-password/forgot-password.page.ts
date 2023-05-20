import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  passwordResetEmail: string;

  constructor(public authService: AuthService, private route: Router) { }

  ngOnInit() {
  }

  redirectLanding() {
    this.route.navigate(['landing']);
  }

}
