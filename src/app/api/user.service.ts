/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { USERS } from '../shared/models/mock-users';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { User } from '../shared/models/user.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // userObject: any;
  currentUser: User;

  private userObject = new BehaviorSubject<User>(null);
  selectedUser$ = this.userObject.asObservable();

  constructor(public afs: AngularFirestore, private http: HttpClient) {}

  getUser(user: any): Observable<any> {
    if (!user) {
      return of(null);
    }
    // return this.afs.collection<User>('users', ref => ref.where('email', '==', user.email).limit(1)).get();
    const httpOptions = {
      // headers: new HttpHeaders({
      //   // Authorization: 'Bearer ' + user.uid,
      //   'Access-Control-Allow-Origin': '*',
      // }),
      params: { uid: user.uid }
    };
    return this.http.get(`${environment.apiUrl}/${environment.getUserEndpoint}`, httpOptions);
  }

  saveUserToLocal(user: User) {
    this.getUser(user).subscribe((u) => {
      this.userObject.next(u);
    });
  }

  async getCurrentUser() {
    if (localStorage.getItem('user') === 'null') {
      return null;
    }
    if (!this.userObject.value) {
      const u = await this.getUser(JSON.parse(localStorage.getItem('user'))).toPromise();
      this.userObject.next(u);
    }
    return this.userObject.value;
  }

  // set locally
  setCurrentUser(user: User) {
    this.userObject.next(user);
  }

  updateCurrentUserVerified(user: User) {
    // update everywhere
    this.userObject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
    return this.http.post(`${environment.apiUrl}/${environment.updateUserEndpoint}`, { emailVerified: user.emailVerified });
  }

  updateCurrentUserPayment(user: User) {
    // update everywhere
    this.userObject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
    return this.http.post(`${environment.apiUrl}/${environment.updateUserEndpoint}`, { payment: user.payment });
  }

  saveUserDetails(user) {
    const updatedUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      occupation: user.occupation,
      city: user.city,
      country: user.country,
    };

    return this.http.post(`${environment.apiUrl}/${environment.updateUserEndpoint}`, updatedUser);
  }

  saveUserOnboardingDetails(user: User, userDetails) {
    const updatedUser = {
      completedOnboarding: true,
      userType: userDetails.userType,
      occupation: userDetails.occupation,
      city: userDetails.city,
      country: userDetails.country,
      socialPlatform: userDetails.socialPlatform,
      socialHandle: userDetails.socialHandle,
      signedContracts: userDetails.signedContracts,
      receivedContracts: userDetails.receivedContracts,
      negotiationStatus: userDetails.negotiationStatus,
    };

    return this.http.post(`${environment.apiUrl}/${environment.updateUserEndpoint}`, updatedUser);
  }

  saveUserOnboardingDetailsTalent(user: User, userDetails) {
    const updatedUser = {
      completedOnboarding: true,
      userType: userDetails.userType,
      city: userDetails.city,
      country: userDetails.country,
      numTalentRepresented: userDetails.numTalentRepresented,
      talentBase: userDetails.talentBase,
      receivedContracts: userDetails.receivedContracts,
      numPeopleNegotiating: userDetails.numPeopleNegotiating,
      otherToolsUsed: userDetails.otherToolsUsed,
    };

    return this.http.post(`${environment.apiUrl}/${environment.updateUserEndpoint}`, updatedUser);
  }
}
