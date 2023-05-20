import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { UserService } from 'src/app/api/user.service';
import { NegotationStatus } from 'src/app/shared/enums/negotiationStatus.enum';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {
  currentUser: User;
  userDetailsFormCreator: FormGroup;
  userDetailsFormAgent: FormGroup;
  errorNote: string;
  userType: string;

  constructor(private userService: UserService,
    public formBuilder: FormBuilder,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    public router: Router) { }

  async ngOnInit() {
    const u = await this.userService.getCurrentUser();
    this.currentUser = u;

    this.userDetailsFormCreator = this.formBuilder.group({
      userType: 'talent',
      occupation: ['', [Validators.required, Validators.minLength(2)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      socialPlatform: ['', [Validators.required, Validators.minLength(2)]],
      socialHandle: ['', [Validators.required, Validators.minLength(2)]],
      signedContracts: [null, Validators.required],
      receivedContracts: [null, Validators.required],
      negotiationStatus: [NegotationStatus.HAS_AND_WILL, Validators.required],
    });

    this.userDetailsFormAgent = this.formBuilder.group({
      userType: 'agent',
      city: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      numTalentRepresented: [null, Validators.required],
      talentBase: ['', [Validators.required, Validators.minLength(2)]],
      receivedContracts: [null, Validators.required],
      numPeopleNegotiating: [null, Validators.required],
      otherToolsUsed: ['', Validators.required],
    });
  }

  async signUp() {
    if (this.userType === 'talent') {
      if (this.userDetailsFormCreator.invalid) {
        this.errorNote = 'One or more fields are missing.';
        return;
      } else {
        const alert = await this.alertController.create({
          header: 'Disclaimer',
          cssClass: 'custom-alert',
          subHeader: 'Before proceeding, please read the following.',
          message: 'KAVEAT DOES NOT PROVIDE LEGAL ADVICE. ALL INFORMATION IS FOR GENERAL, EDUCATIONAL PURPOSES.',
          buttons: ['OK'],
        });

        const loading = await this.loadingCtrl.create({
          message: 'Creating your dashboard...',
          duration: 3000,
          cssClass: 'custom-loading',
        });

        loading.present();
        this.currentUser.completedOnboarding = true;
        // save to backend
        // this.userService.updateCurrentUserOnboarding(this.currentUser);
        // save local
        this.userService.setCurrentUser(this.currentUser);
        this.userService.saveUserOnboardingDetails(this.currentUser, this.userDetailsFormCreator.getRawValue()).subscribe((res: User) => {
          loading.dismiss();
          alert.present();
          this.userService.saveUserToLocal(this.currentUser);
          this.router.navigate(['home-dashboard/main']);
        });
      }
    } else {
      if (this.userDetailsFormAgent.invalid) {
        this.errorNote = 'One or more fields are missing.';
        return;
      } else {
        const alert = await this.alertController.create({
          header: 'Disclaimer',
          cssClass: 'custom-alert',
          subHeader: 'Before proceeding, please read the following.',
          message: 'KAVEAT DOES NOT PROVIDE LEGAL ADVICE. ALL INFORMATION IS FOR GENERAL, EDUCATIONAL PURPOSES.',
          buttons: ['OK'],
        });

        const loading = await this.loadingCtrl.create({
          message: 'Creating your dashboard...',
          duration: 3000,
          cssClass: 'custom-loading',
        });

        loading.present();
        this.currentUser.completedOnboarding = true;
        // save to backend
        // this.userService.updateCurrentUserOnboarding(this.currentUser);
        // save local
        this.userService.setCurrentUser(this.currentUser);
        this.userService.saveUserOnboardingDetailsTalent(this.currentUser, this.userDetailsFormAgent.getRawValue()).subscribe(
          (res: User) => {
          loading.dismiss();
          alert.present();
          this.userService.saveUserToLocal(this.currentUser);
          this.router.navigate(['home-dashboard/main']);
        });
      }
    }

    // this.authService.signUp(newUser, this.userPassword);
    return true;
  }

  handleChange(e) {
    // console.log(e.detail.value);
    // console.log(this.userDetailsFormCreator.getRawValue());
  }

  errorControl() {
    return this.userDetailsFormCreator.controls;
  }

  redirectLanding() {
    this.router.navigate(['landing']);
  }

}
