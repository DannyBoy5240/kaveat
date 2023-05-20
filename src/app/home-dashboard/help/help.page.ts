import { Component, OnInit } from '@angular/core';
import { FAQS } from 'src/app/shared/models/faqs';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  questions = FAQS;

  constructor() { }

  ngOnInit() {
  }

}
