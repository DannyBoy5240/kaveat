import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AccountResolver } from './resolvers/account.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  // {
  //   path: 'folder/:id',
  //   loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  // },
  {
    path: 'settings',
    loadChildren: () => import('./home-dashboard/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'analysis-view/:id',
    loadChildren: () => import('./home-dashboard/contracts/analysis-view/analysis-view.module').then( m => m.AnalysisViewPageModule)
  },
  {
    path: 'analysis-github',
    loadChildren: () => import('./home-dashboard/contracts/analysis-github/analysis-github.module').then( m => m.AnalysisGithubPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registration',
    loadChildren: () => import('./registration/registration.module').then( m => m.RegistrationPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'landing',
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'verify-email',
    loadChildren: () => import('./verify-email/verify-email.module').then( m => m.VerifyEmailPageModule)
  },
  {
    path: 'home-dashboard',
    resolve: { account: AccountResolver },
    canActivate: [AuthGuard],
    loadChildren: () => import('./home-dashboard/home-dashboard.module').then( m => m.HomeDashboardPageModule)
  },
  // {
  //   path: 'payment',
  //   loadChildren: () => import('./payment/payment.module').then( m => m.PaymentPageModule)
  // }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
