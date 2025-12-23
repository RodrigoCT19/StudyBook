import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
 
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then( m => m.MainPageModule)
  },
  {
    path: 'reserva',
    loadChildren: () => import('./pages/main/reserva/reserva.module').then(m => m.ReservaPageModule)
  },
  {
    path: 'horarios',
    loadChildren: () => import('./pages/main/horarios/horarios.module').then(m => m.HorariosPageModule)
  },
  {
    path: 'salas',
    loadChildren: () => import('./pages/main/salas/salas.module').then(m => m.SalasPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
