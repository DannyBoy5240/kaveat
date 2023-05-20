import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../shared/models/user.model';
import { AuthService } from '../shared/services/auth.service';
import { PasswordValidator } from '../validators/password.validator';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  newUser: User;
  userForm = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    userPassword: ['', [Validators.required, Validators.minLength(2)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(2)],
      (control => PasswordValidator.confirmPassword(control, this.userForm, 'userPassword'))],
    // referralCode: '',
  });

  errorNote: string;
  consentTerms = false;
  consentPaymentTerms = false;
  consentTimestamp: number;

  constructor(public authService: AuthService, private route: Router, public formBuilder: FormBuilder) { }

  ngOnInit() {
  }

  isCheckedTerms(event) {
    if (event.detail.checked) {
      this.consentTerms = true;
    } else {
      this.consentTerms = false;
    }
  }

  isCheckedPaymentTerms(event) {
    if (event.detail.checked) {
      this.consentPaymentTerms = true;
    } else {
      this.consentPaymentTerms = false;
    }
  }

  signUp() {
    if (this.userForm.invalid) {
      this.errorNote = 'One or more fields are missing.';
      return;
    }
    this.newUser = {
      firstName: this.userForm.get('firstName').value,
      lastName: this.userForm.get('lastName').value,
      email: this.userForm.get('email').value,
      emailVerified: false,
      contracts: [],
      completedOnboarding: false,
      consentTimestamp: Date.now(),
      // referralCode: this.userForm.get('referralCode').value
    };

    this.authService.signUp(this.newUser, this.userForm.get('userPassword').value).catch((error) => {
      // console.log(error.code);
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/weak-password') {
        // alert('The password is too weak.');
        this.errorNote = 'The password is too weak.';
      } else if (errorCode === 'auth/invalid-email') {
        // alert('Missing fields');
        this.errorNote = 'One or more fields are missing.';
      } else {
        // alert(errorMessage);
        this.errorNote = 'Error!';
      }
      // console.log(error);
    }).then();
  }

  redirectLanding() {
    this.route.navigate(['landing']);
  }

}
