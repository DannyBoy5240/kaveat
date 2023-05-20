import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { PaymentService } from 'src/app/api/payment.service';
import { UserService } from 'src/app/api/user.service';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  userForm: FormGroup;
  currentUser: User;
  // token: string;

  constructor(public formBuilder: FormBuilder,
     private route: ActivatedRoute,
     private router: Router,
     private userService: UserService,
     private paymentService: PaymentService,
      private alertController: AlertController,
      private loadingCtrl: LoadingController,
      private toastController: ToastController,
      private authService: AuthService) { }

  async ngOnInit() {
    const u = await this.userService.getCurrentUser();
    this.currentUser = u;
    // console.log('settings currentUsers:', this.currentUser);
    this.userForm = this.formBuilder.group({
      firstName: [this.currentUser.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.currentUser.lastName, [Validators.required, Validators.minLength(2)]],
      email: {value: this.currentUser.email, disabled: true},
      occupation: [this.currentUser.occupation, [Validators.required, Validators.minLength(2)]],
      city: [this.currentUser.city, [Validators.required, Validators.minLength(2)]],
      country: [this.currentUser.country, [Validators.required, Validators.minLength(2)]],
    });

    if (this.currentUser.userType === 'agent') {
      this.userForm.removeControl('occupation');
    }

    this.authService.getFireAuthUser().subscribe((t) => {});

  }

  errorControl() {
    return this.userForm.controls;
  }

  async submitForm(position: 'top' | 'middle' | 'bottom') {
    // const loading = await this.loadingCtrl.create({
    //   // message: 'Dismissing after 3 seconds...',
    //   duration: 3000,
    // });

    // loading.present();
    const toast = await this.toastController.create({
      message: 'Update Successful!',
      duration: 1500,
      position,
      cssClass: 'custom-toast',
    });

    if (!this.userForm.valid) {
      const alert = await this.alertController.create({
        header: 'Uh Oh',
        cssClass: 'custom-alert',
        // subHeader: 'Before proceeding, please read the following.',
        message: 'Please provide all the required values!',
        buttons: ['OK'],
      });
      // loading.dismiss();
      alert.present();
      return false;
    } else {
      const successAlert = await this.alertController.create({
        header: 'Updated!',
        cssClass: 'custom-alert',
        // subHeader: 'Before proceeding, please read the following.',
        message: 'Your profile was successfully updated.',
        buttons: ['OK'],
      });

      // TODO: update function to accept any combo of fields to update, right now failing bc some fields missing
      this.userService.saveUserDetails(this.userForm.getRawValue()).subscribe((res) => {
        toast.present();
        this.userService.saveUserToLocal(this.currentUser);
      });
    }
  }

  changePlan() {
    // redirect to payment page
    // this.router.navigate(['/home-dashboard/upload/payment']);
    this.paymentService.accessCustomerPortal(this.currentUser.stripeId).subscribe(result => {
      window.location.href = result as string;
    });
  }

}
