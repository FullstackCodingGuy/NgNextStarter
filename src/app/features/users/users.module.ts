import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersPlaceholderComponent } from './users-placeholder.component';

@NgModule({
  imports: [
    SharedModule,
    UsersRoutingModule,
    UsersPlaceholderComponent
  ]
})
export class UsersModule { }