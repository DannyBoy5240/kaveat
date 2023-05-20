import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ContractService } from '../api/contract.service';
import { UserService } from '../api/user.service';
import { User } from '../shared/models/user.model';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.page.html',
  styleUrls: ['./home-dashboard.page.scss'],
})
export class HomeDashboardPage implements OnInit {

  currentUser: any;

  public appPages = [
    { title: 'Home', url: '/home-dashboard/main', icon: 'planet' },
    { title: 'Upload', url: '/home-dashboard/upload', icon: 'duplicate' },
    { title: 'My Contracts', url: '/home-dashboard/contracts', icon: 'newspaper' },
    { title: 'Document Comparison', url: '/home-dashboard/comparison', icon: 'newspaper' },
    { title: 'Help', url: '/home-dashboard/help', icon: 'help' },
  ];

  constructor(public authService: AuthService,
    public userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    public platform: Platform) {
    }

  async ngOnInit() {
    this.route.data.subscribe(({ account }) => {
      // console.log('Dashboard:', account);
      this.currentUser = account;
    });
    // const u = await this.userService.getCurrentUser();
    // this.currentUser = u;
  }

  navigateToPath(path) {
    this.router.navigate([path], { state: { userMetadata: this.currentUser }});
  }

}
