import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnalysisGithubPageRoutingModule } from './analysis-github-routing.module';

import { AnalysisGithubPage } from './analysis-github.page';

import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor';
import  monacoConfig  from './monaco.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisGithubPageRoutingModule,
    MonacoEditorModule.forRoot(),
  ],
  exports: [],
  declarations: [AnalysisGithubPage]
})
export class AnalysisGithubPageModule {}
