import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnalysisViewPageRoutingModule } from './analysis-view-routing.module';

import { AnalysisViewPage } from './analysis-view.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisViewPageRoutingModule,
  ],
  exports: [],
  declarations: [AnalysisViewPage]
})
export class AnalysisViewPageModule {}
