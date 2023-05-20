import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnalysisViewPage } from './analysis-view.page';

const routes: Routes = [
  {
    path: '',
    component: AnalysisViewPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisViewPageRoutingModule {}
