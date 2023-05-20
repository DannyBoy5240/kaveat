import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/api/user.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.page.html',
  styleUrls: ['./comparison.page.scss'],
})
export class ComparisonPage implements OnInit {
  public folder: string;
  public currentUser: any;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute, 
    private authService: AuthService, 
    private userService: UserService) { }

  async ngOnInit() {
    this.activatedRoute.data.subscribe(({ data }) => {
      this.currentUser = data;
    });
    if (!this.currentUser) {
      const u = await this.userService.getCurrentUser();
      this.currentUser = u;
    }
  }

  compareBtnClicked(event): void {
    const url = 'analysis-github';
    this.router.navigate([url]);
  }
}
