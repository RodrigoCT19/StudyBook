import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilUserPageRoutingModule } from './perfiluser-routing.module';

import { PerfilUserPage } from './perfiluser.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilUserPageRoutingModule
  ],
  declarations: [PerfilUserPage]
})
export class PerfilUserPageModule {}
