import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
 
import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage, 

    children:[

      {
        path: 'horarios',
        loadChildren: () => import('./horarios/horarios.module').then( m => m.HorariosPageModule)
      },
      {
        path: 'reserva',
        loadChildren: () => import('../main/reserva/reserva.module').then( m => m.ReservaPageModule)
      },
      {
        path: 'solicitudes',
        loadChildren: () => import('../main/solicitudes/solicitudes.module').then( m => m.SolicitudesPageModule)
      },
      {
        path: 'salas',
        loadChildren: () => import('./salas/salas.module').then( m => m.SalasPageModule)
      },
      {
        path: 'historial',
        loadChildren: () => import('./historial/historial.module').then( m => m.HistorialPageModule)
      },
      {
        path: 'acerca',
        loadChildren: () => import('./acerca/acerca.module').then( m => m.AcercaPageModule)
      },
      {
    path: 'perfiluser',
    loadChildren: () => import('./perfiluser/perfiluser.module').then( m => m.PerfilUserPageModule)
  },
    ]
    
  },             
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
