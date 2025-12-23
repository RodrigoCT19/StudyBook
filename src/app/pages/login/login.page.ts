import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User, Users } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private firebaseSvc: FirebaseService, private utilsSvc: UtilsService) {}

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const res = await this.firebaseSvc.signIn(this.form.value as User);
        if (res && res.user) {
          const user = await this.firebaseSvc.getDocument(`users/${res.user.uid}`) as Users; // Use the Users interface here
          if (user.disabled) {
            throw new Error('Su cuenta está bloqueada. Por favor, contacte al soporte.');
          } else {
            await this.getUserInfo(res.user.uid);
          }
        } else {
          throw new Error('No se pudo iniciar sesión correctamente. Verifica tus credenciales.');
        }
      } catch (error) {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message || 'Ha ocurrido un error. Verifica tus credenciales e intenta nuevamente.',
          duration: 2000,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });

      } finally {
        loading.dismiss();
      }
    }
  }

  async getUserInfo(uid: string) {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const user = await this.firebaseSvc.getDocument(`users/${uid}`) as Users; // Use the Users interface here
      if (user) {
        this.utilsSvc.saveInLocalStorage('user', user);
        this.utilsSvc.routink('/main/salas');
        this.form.reset();

        // Mostrar mensaje de bienvenida
        this.utilsSvc.presentToast({
          message: `Bienvenido ${user.name}`,
          duration: 2000,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } else {
        throw new Error('No se encontró la información del usuario.');
      }
    } catch (error) {
      console.log(error);

      this.utilsSvc.presentToast({
        message: error.message || 'Ha ocurrido un error al obtener la información del usuario.',
        duration: 1500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }
}
