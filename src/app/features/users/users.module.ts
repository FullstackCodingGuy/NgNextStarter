import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    UsersRoutingModule
  ]
})
export class UsersModule { }