import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Users } from 'src/app/models/user.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  user: Users | null = null;
  pages = [
    { title: 'Mi Perfil', url: '/main/perfiluser' },
    { title: 'Salas de estudio', url: '/main/salas' },
    { title: 'Mi Reserva', url: '/main/reserva' },
    { title: 'Mi Historial', url: '/main/historial' },
    { title: 'Acerca de', url: '/main/acerca', },
  ];

  router = inject(Router);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  menuCtrl = inject(MenuController);
  currentPath: string = '';

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event?.url) this.currentPath = event.url;
    });
    this.loadUserData();
  }

  async loadUserData() {
    const email = this.utilsSvc.getFromLocalStorage('user')?.email;
    if (email) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
      try {
        const users = await this.firebaseSvc.getUserByEmail(email);
        if (users.length > 0) {
          this.user = users[0];
        } else {
          throw new Error('Usuario no encontrado');
        }
        loading.dismiss();
      } catch (error: any) {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 1500,
          color: 'secondary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
        loading.dismiss();
      }
    }
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  navigateToEditProfile() {
    this.router.navigate(['/editarperfil']);
  }

  async signOut() {
    try {
      this.utilsSvc.removeFromLocalStorage('user');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during sign out:', error);
      this.utilsSvc.presentToast({
        message: 'Error during sign out',
        duration: 2000,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
    }
  }

  navigateToProfile() {
    this.router.navigate(['/main/perfiluser']);
  }
}
