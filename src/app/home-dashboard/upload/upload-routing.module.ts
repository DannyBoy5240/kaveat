import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadPage } from './upload.page';

const routes: Routes = [
  {
    path: '',
    component: UploadPage
  },
  {
    path: 'payment/:contractId',
    loadChildren: () => import('../../payment/payment.module').then( m => m.PaymentPageModule)
  },
  {
    path: 'payment/success/:session_id',
    loadChildren: () => import('../../payment/success/success.module').then( m => m.SuccessPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadPageRoutingModule {}
