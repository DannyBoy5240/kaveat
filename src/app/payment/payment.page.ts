import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { StripeService, StripeCardComponent, StripeCardNumberComponent } from 'ngx-stripe';
import { switchMap, map, tap } from 'rxjs/operators';

import {
  StripeCardElementOptions,
  StripeElementsOptions,
  PaymentIntent,
  StripeCardElementChangeEvent
} from '@stripe/stripe-js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { DomController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  @ViewChild(StripeCardNumberComponent) card: StripeCardNumberComponent;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  stripeTest: FormGroup;
  currentUser: any;
  stripeId: string;
  priceTableId: string;
  publishKey: string;
  contractId: string;

  constructor(private http: HttpClient,
    private stripeService: StripeService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,) {
      this.contractId = this.route.snapshot.params.contractId;
      this.priceTableId = environment.stripePriceTableId;
      this.publishKey = environment.stripePK;
    }

  async ngOnInit() {
    this.stripeTest = this.fb.group({
      name: ['', [Validators.required]]
    });

    const u = await this.userService.getCurrentUser();
    this.currentUser = u;
    this.stripeId = u.stripeId;
    this.loadScripts();
  }

  checkout() {
    // Check the server.js tab to see an example implementation
    const httpOptions = {
      headers: new HttpHeaders({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Access-Control-Allow-Origin': '*',
      })
    };
    this.http.post('http://127.0.0.1:8000/create-checkout-session', null, httpOptions)
      .pipe(
        map(this.extractData)
      )
      .subscribe(result => {
        // If `redirectToCheckout` fails due to a browser or network
        // error, you should display the localized error message to your
        // customer using `error.message`.
        const redirecturl = result.headers.Location;
        window.location.href = redirecturl;
        // this.router.navigate([redirecturl]);
      });
  }

  loadScripts() {
    const dynamicScripts = [
     'https://js.stripe.com/v3/pricing-table.js'
    ];
    dynamicScripts.forEach(s => {
      const node = document.createElement('script');
      node.src = s;
      node.type = 'text/javascript';
      node.async = false;
      document.getElementsByTagName('head')[0].appendChild(node);
    });
  }

  loadPricingDetails() {
    document.querySelector('stripe-pricing-table').setAttribute('customer-email', this.currentUser.email);
    document.querySelector('stripe-pricing-table').setAttribute('client-reference-id', this.currentUser.uid);
  }

  private extractData(res: any) {
    const body = res;
    return body;
  }

}
