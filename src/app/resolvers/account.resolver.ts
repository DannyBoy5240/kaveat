import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { User } from '../shared/models/user.model';
import { UserService } from '../api/user.service';
import { AuthService } from '../shared/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountResolver implements Resolve<any> {

  constructor(private authService: AuthService, private userService: UserService) {}

  resolve() {
    return this.userService.getUser(JSON.parse(localStorage.getItem('user')));
  }

}
