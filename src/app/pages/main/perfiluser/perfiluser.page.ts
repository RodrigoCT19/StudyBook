import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Users } from 'src/app/models/user.model';

@Component({
  selector: 'app-perfiluser',
  templateUrl: './perfiluser.page.html',
  styleUrls: ['./perfiluser.page.scss'],
})
export class PerfilUserPage implements OnInit {
  user: Users | null = null;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const user = this.utilsSvc.getFromLocalStorage('user') as Users;
    if (user) {
      this.user = user;
    } else {
      console.error('No se encontró el ID de usuario en el almacenamiento local.');
      this.utilsSvc.presentToast({
        message: 'No se encontró el ID de usuario.',
        duration: 2000,
        color: 'danger',
        position: 'middle'
      });
    }
  }

  logout() {
    this.firebaseSvc.signOut();
  }
}
