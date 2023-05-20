import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient,) { }

  // getPaymentId(subId: string) {
  //   // Check the server.js tab to see an example implementation
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       // eslint-disable-next-line @typescript-eslint/naming-convention
  //       'Access-Control-Allow-Origin': '*',
  //     }),
  //     params: { subId }
  //   };
  //   return this.http.get(`${environment.apiUrl}/${environment.subscriptionEndpoint}`, httpOptions);
  // }

  retrieveSession(sessionId: string) {
    const httpOptions = {
      params: { sessionId }
    };
    return this.http.get(`${environment.apiUrl}/${environment.paymentSessionEndpoint}`, httpOptions);
  }

  getValidPromoCodes() {
    return this.http.get(`${environment.apiUrl}/${environment.validCodes}`);
  }

  // TODO: cancel subscription: prompt user to double confirm before executing cancellation
  cancelSubscription(subId: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Access-Control-Allow-Origin': '*',
      }),
      params: { subId }
    };
    // DUMMY response for now
    return of('woo cancelled subscription!');
    // return this.http.get(`${environment.apiUrl}/cancel-subscription`, httpOptions);
  }

  // TODO: upgrade to subscription?
  accessCustomerPortal(stripeId: string) {
    const httpOptions = {
      // headers: new HttpHeaders({
      //   // eslint-disable-next-line @typescript-eslint/naming-convention
      //   'Access-Control-Allow-Origin': '*',
      // }),
      params: { customerId: stripeId }
    };

    return this.http.post(`${environment.apiUrl}/${environment.paymentCustomerPortalEndpoint}`, null, httpOptions);
  }
}
