import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractsPage } from './contracts.page';

const routes: Routes = [
  {
    path: '',
    component: ContractsPage
  },
  // {
  //   path: 'analysis',
  //   loadChildren: () => import('./analysis/analysis.module').then( m => m.AnalysisPageModule)
  // },
  {
    path: 'analysis/:id',
    loadChildren: () => import('./analysis/analysis.module').then( m => m.AnalysisPageModule)
  },
  {
    path: 'analysis-github/:id',
    loadChildren: () => import('./analysis-github/analysis-github.module').then( m => m.AnalysisGithubPageModule)
  },
  {
    path: 'feedback',
    loadChildren: () => import('./feedback/feedback.module').then( m => m.FeedbackPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractsPageRoutingModule {}
