import { Component, OnInit } from '@angular/core';
import { ContractService } from 'src/app/api/contract.service';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/api/user.service';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PaymentService } from 'src/app/api/payment.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})

export class UploadPage implements OnInit {
  // fileTransfer: FileTransferObject;
  currentUser: any;
  file: any;
  blob: any;

  // multiple uploads
  selectedFiles: FileList;
  selectedFilesList: any[];
  progressInfos: any[] = [];
  message: string[] = [];
  fileInfos?: Observable<any>;

  validCodes: string[] = [];
  referralCode: string;

  constructor(private route: ActivatedRoute,
    private router: Router,
    public contractService: ContractService,
    private authService: AuthService,
    private userService: UserService,
    private paymentService: PaymentService,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    public platform: Platform
    ) { }

  async ngOnInit() {
    const u = await this.userService.getCurrentUser();
    this.currentUser = u;
    this.paymentService.getValidPromoCodes().subscribe((codes: string[]) => {
      this.validCodes = codes;
    });
  }

  loadFileFromDevice(event) {
    // Get a reference to the file that has just been added to the input
    this.file = event.target.files[0];

    const reader = new FileReader();

    reader.readAsArrayBuffer(this.file);

    reader.onload = () => {
      // get the blob of the file:
      this.blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);

      // create blobURL, such that we could use it in an image element:
      // const blobURL: string = URL.createObjectURL(blob);
    };

    reader.onerror = (error) => {
      //handle errors
    };
  }

  selectFiles(event): void {
    // this.message = [];
    // this.progressInfos = [];
    if (!this.selectedFiles) {
      this.selectedFiles = event.target.files;
      this.selectedFilesList = Array.from(this.selectedFiles);
    } else {
      // append to existing
      const dataTransfer = new DataTransfer();
      // add existing files
      for(let i = 0; i < this.selectedFiles.length; i++) {
        dataTransfer.items.add(this.selectedFiles.item(i));
      }
      // add new files
      for(const newFile of event.target.files) {
        dataTransfer.items.add(newFile);
      }
      this.selectedFiles = dataTransfer.files;
      this.selectedFilesList = Array.from(this.selectedFiles);
    }
  }

  removeFile(idx: number) {
    const dataTransfer = new DataTransfer();
    for(let i = 0; i < this.selectedFiles.length; i++) {
      if (i !== idx) {
        dataTransfer.items.add(this.selectedFiles.item(i));
      }
    }
    this.selectedFiles = dataTransfer.files;
    this.selectedFilesList = Array.from(this.selectedFiles);
  }

  // async uploadFiles(showLoading: boolean) {
  //   // this.message = [];
  //   // const loading = await this.loadingCtrl.create({
  //   //   message: 'Uploading contract...',
  //   //   // duration: 10000,
  //   //   spinner: 'circles'
  //   // });
  //   // const success = await this.alertController.create({
  //   //   header: 'Woohoo!',
  //   //   // subHeader: 'Important message',
  //   //   message: 'Your contract has been uploaded. The analysis will be ready to view in the \'My Contracts\' tab within 24 hours.',
  //   //   buttons: ['OK'],
  //   // });
  //   const fileblobs = [];
  //   if (this.selectedFiles) {

  //     // if (showLoading) {
  //     //   loading.present();
  //     // }
  //     for (let i = 0; i < this.selectedFiles.length; i++) {
  //       const reader = new FileReader();
  //       reader.readAsArrayBuffer(this.selectedFiles.item(i));

  //       reader.onload = () => {
  //         // get the blob of the file:
  //         const fileBlob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);
  //         fileblobs.push([this.selectedFiles[i], fileBlob]);
  //         // this.loadFilesFromDevice(i, this.selectedFiles[i], fileBlob);
  //       };

  //       reader.onerror = (error) => {
  //         //handle errors
  //       };
  //     }
  //     // if (showLoading) {
  //     //   loading.dismiss();
  //     //   success.present();
  //     // }
  //     return fileblobs;
  //   }
  // }

  // loadFilesFromDevice(idx: number, file: File, fileBlob: Blob) {
  //   // this.progressInfos[idx] = { value: 0, fileName: file.name };

  //   if (file) {
  //     this.contractService.uploadContract(this.currentUser, file.name, fileBlob).subscribe(
  //       (res) => {
  //       },
  //       (err: any) => {
  //         // this.progressInfos[idx].value = 0;
  //         const msg = 'Could not upload the file: ' + file.name;
  //         this.message.push(msg);
  //         // this.fileInfos = this.uploadService.getFiles();
  //       });
  //   }

  // }

  async submitContracts() {
    const loading = await this.loadingCtrl.create({
      message: 'Uploading contract...',
      // duration: 10000,
      spinner: 'circles'
    });
    const success = await this.alertController.create({
      header: 'Woohoo!',
      // subHeader: 'Important message',
      message: 'Your contract has been uploaded. The analysis will be ready to view in the \'My Contracts\' tab within 24 hours.',
      buttons: ['OK'],
    });

    if (this.selectedFiles) {
      // TODO: Prompt payment here if not no payment or no subscription
      // if (!this.currentUser.payment || this.currentUser.payment[0].mode !== 'subscription') {
      const epochNow = Date.now();
      if (this.currentUser.invoicePaid && this.currentUser.userType === 'agent') {
        // if enterprise (agent) & they paid
        // setup files to send
        loading.present();
        // const files = await this.uploadFiles(true);
        // success.present();
        this.contractService.uploadMultipleContracts(this.currentUser, this.selectedFilesList).subscribe((res) => {
          loading.dismiss();
          success.present();
          this.router.navigate(['/home-dashboard/contracts']);
        });
      } else if (!this.currentUser.stripeId || this.currentUser.planStatus !== 'active'
       || !this.currentUser.invoicePaid
        || this.currentUser.currentPeriodEnd*1000 < epochNow) {
          // scenario should never happen where subscription is up but can still upload multiple
          // console.log('uhoh');
        // this.uploadFiles(false);
        // this.router.navigate(['/home-dashboard/upload/payment'], { state: { userMetadata: this.currentUser }});
          // loading.present();
          // await this.uploadFiles(false);
          // loading.dismiss();
          // success.present();
          // this.router.navigate(['/home-dashboard/upload/payment'], { state: { userMetadata: this.currentUser }});
          this.contractService.uploadMultipleContracts(this.currentUser, this.selectedFilesList).subscribe((res) => {
            // loading.dismiss();
            // success.present();
            this.router.navigate(['/home-dashboard/upload/payment'], { state: { userMetadata: this.currentUser }});
          });
      } else {
        loading.present();
        // this.uploadFiles(true);
        // loading.dismiss();
        // success.present();
        // this.router.navigate(['/home-dashboard/contracts']);
        this.contractService.uploadMultipleContracts(this.currentUser, this.selectedFilesList).subscribe((res) => {
          loading.dismiss();
          success.present();
          this.router.navigate(['/home-dashboard/contracts']);
        });
      }
    } else if (this.file) {
      const epochNow = Date.now();
      // check if user has valid referral/promo code
      // if (this.currentUser.referralCode && this.validCodes.includes(this.currentUser.referralCode)) {
      if (this.referralCode && this.validCodes.includes(this.referralCode)) {
        // console.log('valid promo code ', this.referralCode);
        loading.present();
        this.contractService.uploadContract(this.currentUser, this.file.name, this.blob, this.referralCode).subscribe((res) => {
          loading.dismiss();
          success.present();
          this.router.navigate(['/home-dashboard/contracts']);
        });
      } else if (!this.currentUser.stripeId || this.currentUser.planStatus !== 'active'
       || !this.currentUser.invoicePaid
        || this.currentUser.currentPeriodEnd*1000 < epochNow) {
        this.contractService.uploadContract(this.currentUser, this.file.name, this.blob).subscribe((res) => {
          // user is uploading for the first time or is on pay per contract plan
          const url = '/home-dashboard/upload/payment/' + res.newContracts[0];
          this.router.navigate([url], { state: { userMetadata: this.currentUser }});
        });
        // const url = '/home-dashboard/upload/payment/' + res;
        // this.router.navigate([url], { state: { userMetadata: this.currentUser }});
      } else {
        loading.present();
        this.contractService.uploadContract(this.currentUser, this.file.name, this.blob).subscribe((res) => {
          loading.dismiss();
          success.present();
          this.router.navigate(['/home-dashboard/contracts']);
        });
      }
    } else {
      // error
      const alert = await this.alertController.create({
        header: 'Uh oh!',
        // subHeader: 'Important message',
        message: 'Please select a file',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  // async submitForm() {
  //   if (this.file) {
  //     // await this.contractService.uploadContract(this.file);
  //     const loading = await this.loadingCtrl.create({
  //       message: 'Uploading contract...',
  //       duration: 10000,
  //       spinner: 'circles'
  //     });
  //     const success = await this.alertController.create({
  //       header: 'Woohoo!',
  //       // subHeader: 'Important message',
  //       message: 'Your contract has been uploaded. The analysis will be ready to view in the \'My Contracts\' tab within 24 hours.',
  //       buttons: ['OK'],
  //     });

  //     // save contract first then prompt payment
  //     // this.contractService.uploadContract(this.currentUser, this.file.name, this.blob).subscribe((res) => {
  //     //   console.log('response status:', res.status);
  //     // });
  //     // TODO: Prompt payment here if not no payment or no subscription
  //     // if (!this.currentUser.payment || this.currentUser.payment[0].mode !== 'subscription') {
  //     const epochNow = Date.now();
  //     console.log(epochNow);
  //     if (!this.currentUser.stripeId || this.currentUser.planStatus !== 'active'
  //      || !this.currentUser.invoicePaid
  //       || this.currentUser.currentPeriodEnd*1000 < epochNow) {
  //       this.contractService.uploadContract(this.currentUser, this.file.name, this.blob).subscribe((res) => {
  //         console.log('response status:', res.status);
  //       });
  //       this.router.navigate(['/home-dashboard/upload/payment'], { state: { userMetadata: this.currentUser }});
  //     } else {
  //       loading.present();
  //       this.contractService.uploadContract(this.currentUser, this.file.name, this.blob).subscribe((res) => {
  //         console.log('response status:', res.status);
  //         loading.dismiss();
  //         success.present();
  //       });
  //     }

  //     // TODO: delay this until contract finishes upload
  //     // const success = await this.alertController.create({
  //     //   header: 'Woohoo!',
  //     //   // subHeader: 'Important message',
  //     //   message: 'Your contract has been uploaded. The analysis will be ready within 24 hours.',
  //     //   buttons: ['OK'],
  //     // });
  //     // success.present();
  //     // await loading.present();
  //   } else {
  //     // error
  //     const alert = await this.alertController.create({
  //       header: 'Uh oh!',
  //       // subHeader: 'Important message',
  //       message: 'Please select a file',
  //       buttons: ['OK'],
  //     });
  //     await alert.present();
  //   }
  // }


}
