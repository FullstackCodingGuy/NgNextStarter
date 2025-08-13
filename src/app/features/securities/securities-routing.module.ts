import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecuritiesPlaceholderComponent } from './securities-placeholder.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: SecuritiesPlaceholderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecuritiesRoutingModule { }