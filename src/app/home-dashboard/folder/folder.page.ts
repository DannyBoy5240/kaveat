import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/api/user.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public currentUser: any;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService, private userService: UserService) { }

  async ngOnInit() {
    this.activatedRoute.data.subscribe(({ data }) => {
      this.currentUser = data;
    });
    if (!this.currentUser) {
      const u = await this.userService.getCurrentUser();
      this.currentUser = u;
    }
  }

}
