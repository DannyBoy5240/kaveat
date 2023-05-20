import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnalysisGithubPage } from './analysis-github.page';

const routes: Routes = [
  {
    path: '',
    component: AnalysisGithubPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisGithubPageRoutingModule {}
