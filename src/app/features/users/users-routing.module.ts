import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersPlaceholderComponent } from './users-placeholder.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: UsersPlaceholderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }