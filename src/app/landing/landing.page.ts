import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  token: string;

  constructor(private activatedRoute: ActivatedRoute,
    private route: Router,
    private authService: AuthService,
    private userService: UserService) { }

  ngOnInit() {
    this.authService.isLoggedIn.then((val) => {
      if (val === true) {
        this.userService.getUser(JSON.parse(localStorage.getItem('user'))).subscribe((u) => {
          this.userService.setCurrentUser(u);
          this.route.navigate(['home-dashboard']);
        });
      }
    });
  }

}
