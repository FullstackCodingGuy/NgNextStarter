import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SecuritiesRoutingModule } from './securities-routing.module';
import { SecuritiesPlaceholderComponent } from './securities-placeholder.component';

@NgModule({
  imports: [
    SharedModule,
    SecuritiesRoutingModule,
    SecuritiesPlaceholderComponent
  ]
})
export class SecuritiesModule { }