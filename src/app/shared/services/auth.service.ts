/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable, NgZone } from '@angular/core';
import { User } from '../models/user.model';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { UserService } from 'src/app/api/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { rejects } from 'assert';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any; // Save logged in user data

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private userService: UserService,
    private http: HttpClient
  ) {
    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user'));
      }
    });

  }

    // Returns true when user is logged in and email is verified AND if completed onboarding
    get isLoggedIn() {
        // const user = JSON.parse(localStorage.getItem('user'));
        return this.userService.getCurrentUser().then(u => u !== null && u.emailVerified && u.completedOnboarding ? true : false);
        // return user !== null && user.emailVerified !== false ? true : false;
    }

    getAuthToken() {
      return this.afAuth.idToken;
    }

    getFireAuthUser() {
      return this.afAuth.user;
    }

  // Sign in with email/password
  async signIn(email: string, password: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Logging in...',
      duration: 5000,
    });

    // display disclaimer pop-up upon login
    const alert = await this.alertController.create({
      header: 'Disclaimer',
      cssClass: 'custom-alert',
      subHeader: 'Before proceeding, please read the following.',
      message: 'KAVEAT DOES NOT PROVIDE LEGAL ADVICE. ALL INFORMATION IS FOR GENERAL, EDUCATIONAL PURPOSES.',
      buttons: ['OK'],
    });

    const alertUserNotFound = await this.alertController.create({
      header: 'Uh-oh',
      cssClass: 'custom-alert',
      subHeader: 'User not found',
      message: 'Either the user does not exist or the login credentials are incorrect.',
      buttons: ['OK'],
    });

    const alertUserNotVerified = await this.alertController.create({
      header: 'Uh-oh',
      cssClass: 'custom-alert',
      subHeader: 'Pending email verification',
      message: 'Please verify your email before proceeding.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Resend Verification',
          role: 'resend',
          handler: () => { this.sendVerificationMail(); }
        },
      ],
    });
    // const { role } = await alert.onDidDismiss();
    
    try {
        loading.present();
        const result = await this.afAuth
            .signInWithEmailAndPassword(email, password);
        this.afAuth.authState.subscribe((user1) => {
            if (user1) {
              this.userData = user1;
              // console.log('signing in user1: ', user1);
              this.getUser().subscribe((u: User) => {
                // console.log('after getUser:', u);
                // if user found in DB
                if (u) {
                  if (user1.emailVerified) {
                    // update emailVerified status on backend
                    u.emailVerified = user1.emailVerified;
                    this.userService.updateCurrentUserVerified(u).subscribe((res) => {
                      // console.log('updated emailVerified field: ', res);
                    }); // testing
                  }
                  this.userService.saveUserToLocal(u);
                  loading.dismiss();
                  // TODO:if first time signing in, redirect to onboarding, otherwise bring to dashboard
                  if (u.completedOnboarding && u.emailVerified) {
                    alert.present();
                    this.router.navigate(['home-dashboard'], { state: { account: u }});
                  } else if (u.emailVerified) {
                    // let's go through onboarding!
                    this.router.navigate(['registration/onboarding']);
                  } else {
                    // alert awaiting email verification
                    alertUserNotVerified.present();
                  }
                } else {
                  alertUserNotFound.present();
                };
              });
            }
        });
      } catch (error) {
        
        loading.dismiss();
        if (error.code === 'auth/user-not-found') {
          alertUserNotFound.present();
        } else {
          alertUserNotFound.present();
        }
        // window.alert(error.message);
      }/*
      return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        
            //this.router.navigate(['home-dashboard']);
          
      })
      .catch((error) => {
        window.alert(error.message);
      });*/
  }
  // Sign up with email/password
  async signUp(user: User, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(user.email, password)
      .then((result) => {
        this.setUserData(result.user, user).subscribe((res) =>{
          // console.log('setUserData result: ', res);
        });
        // ASK for additional user info here? or later?
        this.userService.setCurrentUser(user);
        // this.router.navigate(['registration/onboarding']);

        /* Call the SendVerificaitonMail() function when new user sign
        up and returns promise */
        this.sendVerificationMail();
        // this.router.navigate(['registration/onboarding']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          // alert('The password is too weak.');
        } else if (errorCode === 'auth/invalid-email') {
          // alert('Missing fields');
        }else if (errorCode === 'auth/email-already-in-use') {
          alert('Email is already in use');
        } else {
          // alert(errorMessage);
        }
        // console.log(error);
        // reject(error);
      });
  }
  // Send email verfificaiton when new user sign up
  async sendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email']);
      });
  }
  // Reset Forggot password
  async forgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  // Sign in with Google
  // async googleAuth() {
  //   return this.authLogin(new auth.GoogleAuthProvider()).then((res: any) => {
  //     this.router.navigate(['dashboard']);
  //   });
  // }
  // // Auth logic to run auth providers
  // async authLogin(provider: any) {
  //   return this.afAuth
  //     .signInWithPopup(provider)
  //     .then((result) => {
  //       this.router.navigate(['dashboard']);
  //       this.setUserData(result.user);
  //     })
  //     .catch((error) => {
  //       window.alert(error);
  //     });
  // }

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
   setUserData(user: any, userModel?: User) {
    const userData: User = {
      uid: user.uid,
      email: userModel.email,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      consentTimestamp: userModel.consentTimestamp,
      contracts: userModel.contracts,
      emailVerified: user.emailVerified,
      completedOnboarding: userModel.completedOnboarding,
      // referralCode: userModel.referralCode
    };

    // const formData = new FormData();
    // formData.append('newUser', JSON.stringify(userData));

    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     Authorization: 'Bearer ' + user.auth.currentUser.accessToken,
    //     'Access-Control-Allow-Origin': '*',
    //   })
    // };
    return this.http.post(`${environment.apiUrl}/${environment.newUserEndpoint}`, userData);
  }
  // Sign out
  async signOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.userService.setCurrentUser(null);
      this.router.navigate(['landing']);
    });
  }

  getUser() {
    return this.http.get(`${environment.apiUrl}/${environment.getUserEndpoint}`);
  }
}
