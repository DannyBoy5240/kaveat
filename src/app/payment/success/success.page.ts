import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from 'src/app/api/payment.service';
import { UserService } from 'src/app/api/user.service';
import { Payment } from 'src/app/shared/models/payment.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
})
export class SuccessPage implements OnInit {
  sessionId: string;
  currentUser: User;
  res: any;
  payment: Payment;

  constructor(private route: ActivatedRoute, private paymentService: PaymentService, private userService: UserService) { }

  async ngOnInit() {
    this.sessionId = this.route.snapshot.params.session_id;
    const u = await this.userService.getCurrentUser();
    this.currentUser = u;
    // send to save in user, call stripe apis to get relevant info
    this.paymentService.retrieveSession(this.sessionId).subscribe((res) => {
      // console.log('response:', res);
      this.res = res;
      //check mode if 'payment' or 'subscription'
      this.payment = {
        sessionId: this.sessionId,
        paymentId: this.res.id,
        mode: this.res.object,
      };
      // console.log(this.payment);
      const updatedUser = this.currentUser;
      // add to beginning of list
      if (!updatedUser.payment) {
        updatedUser.payment = [this.payment];
      } else {
        updatedUser.payment.unshift(this.payment);
      }
      this.userService.updateCurrentUserPayment(updatedUser).subscribe((r) => {
        // console.log(r);
      });
    });
  }

}
