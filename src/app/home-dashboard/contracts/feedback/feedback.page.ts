import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { createPopup, createWidget, WidgetOptions } from '@typeform/embed';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  feedbackLink = 'https://tt53qe55v9a.typeform.com/to/JWJAFBpK';

  constructor(public platform: Platform) { }

  ngOnInit() {
    if (this.platform.is('desktop')) {
      // display in-screen if viewing on computer
      const options = {
        container: document.querySelector('#form'),
        iframeProps: {
          style: 'width:45em;height:45em;'
        }
      } as any;
      createWidget('JWJAFBpK', options);
    }
  }

  openSurvey() {
    window.open(this.feedbackLink);
  }

}
