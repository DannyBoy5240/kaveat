import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ContractService } from 'src/app/api/contract.service';
import { UserService } from 'src/app/api/user.service';
import { Contract } from 'src/app/shared/models/contract.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
})
export class ContractsPage implements OnInit {
  myContracts = null;
  currentUser: any;
  predhtml;
  // numUnpaidContracts = 0;
  basePaymentLink = environment.basePaymentLink;

  // filtering and searching
  public results = [];

  constructor(private router: Router,
      public contractService: ContractService,
      private userService: UserService,
      private authService: AuthService,
     private alertController: AlertController,
     private loadingCtrl: LoadingController,
     ) {
   }

  async ngOnInit() {
    const u = await this.userService.getCurrentUser();
    this.currentUser = u;
    this.contractService.loadAllContracts(this.currentUser).subscribe((res) => {
      this.myContracts = res['data'].reverse(); // return in order of most recent
      this.myContracts.forEach(c => {
        // display time as local time
        c.upload_time = new Date(c.upload_time).toLocaleDateString(navigator.language)
         + ', ' + new Date(c.upload_time).toLocaleTimeString(navigator.language);
      });
      this.results = this.myContracts;
    });
  }

  async getOriginal(contract, isAnalysis) {
    const loading = await this.loadingCtrl.create({
      message: 'Grabbing your contract...',
      duration: 10000,
      spinner: 'circles'
    });
    loading.present();
    this.contractService.loadContract(this.currentUser, contract.name, isAnalysis).subscribe((res) => {
      loading.dismiss();
      let newBlob;
      const ext = contract.name.split('.').pop();
      if (ext === 'pdf') {
        // open pdf in browser
        newBlob = new Blob([res], {type: 'application/pdf'});
        const url = URL.createObjectURL(newBlob);
        window.open(url);
        // this.sanitizer.bypassSecurityTrustHtml(res)
      } else {
        // download doc file
        newBlob = new Blob([res], {type: 'application/' + ext});
        const url = URL.createObjectURL(newBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = contract.name;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    });
  }

  async getAnalysis(contract, isAnalysis) {
    const alert = await this.alertController.create({
      header: 'Disclaimer',
      cssClass: 'custom-alert',
      subHeader: 'Before proceeding, please read the following.',
      message: 'KAVEAT DOES NOT PROVIDE LEGAL ADVICE. ALL INFORMATION IS FOR GENERAL, EDUCATIONAL PURPOSES.',
      buttons: [
        {
          text: 'Disagree',
          role: 'disagree',
        },
        {
          text: 'Agree',
          role: 'agree',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'agree') {
      //const url = 'home-dashboard/contracts/analysis/' + contract.id;
      const url = 'analysis-view/' + contract.id;
      //const url = 'home-dashboard/contracts/analysis-github/' + contract.id;
      this.router.navigate([url], { state: { contractMetadata: contract }});
    };
  }

  getContractFile(contract, isAnalysis) {
    this.contractService.loadContract(this.currentUser, contract.name, isAnalysis).subscribe((res) => {
      const url = URL.createObjectURL(res);
      window.open(url);
      // this.sanitizer.bypassSecurityTrustHtml(res)
    });
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Disclaimer',
      subHeader: 'Please read before proceeding',
      message: 'KAVEAT DOES NOT PROVIDE LEGAL ADVICE. ALL INFORMATION IS FOR GENERAL, EDUCATIONAL PURPOSES.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  generatePaymentLink(contract: Contract) {
    window.open(
      this.basePaymentLink +'?prefilled_email='+ this.currentUser.email + '&client_reference_id=' + contract.id,
      '_blank');
  }

  handleInput(event) {
    const query = event.target.value.toLowerCase();
    this.results = this.myContracts.filter((d) => d.name.toLowerCase().indexOf(query) > -1);
  }

}
