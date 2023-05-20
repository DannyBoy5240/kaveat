import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountResolver } from '../resolvers/account.resolver';
import { AnalysisPage } from './contracts/analysis/analysis.page';
import { ContractsPage } from './contracts/contracts.page';
import { HomeDashboardPageModule } from './home-dashboard.module';
import { HomeDashboardPage } from './home-dashboard.page';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: '',
    component: HomeDashboardPage,
    children: [
      {
        path: 'main',
        loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule),
        // resolve: { data: AccountResolver }
      },
      {
        path: 'upload',
        loadChildren: () => import('./upload/upload.module').then( m => m.UploadPageModule)
      },
      {
        path: 'contracts',
        loadChildren: () => import('./contracts/contracts.module').then( m => m.ContractsPageModule)
      },
      // {
      //   path: 'contracts',
      //   component: ContractsPage,
      //   children: [
      //     { path: 'analysis/:id', component: AnalysisPage }
      //   ]
      // },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
      },
      {
        path: 'help',
        loadChildren: () => import('./help/help.module').then( m => m.HelpPageModule)
      },
      {
        path: 'comparison',
        loadChildren: () => import('./comparison/comparison.module').then( m => m.ComparisonPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeDashboardPageRoutingModule {}
