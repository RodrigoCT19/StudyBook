import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  formsb = new FormGroup({
    emailsb: new FormControl('', [Validators.required, Validators.email]),
  });

  firesabeSvcsb = inject(FirebaseService);
  UtilsScvsb = inject(UtilsService);

  ngOnInit() {}

  async submitsb() {
    if (this.formsb.valid) {
      const loadingsb = await this.UtilsScvsb.loading();
      await loadingsb.present();

      this.firesabeSvcsb
        .sendRecoveryEmailsb(this.formsb.value.emailsb)
        .then((res) => {
          this.UtilsScvsb.presentToast({
            message: 'Correo enviado con éxito',
            duration: 1500,
            color: 'danger',
            position: 'middle',
            icon: 'mail-autline',
          });

          this.UtilsScvsb.routink('/login');
          this.formsb.reset();
        })
        .catch((error) => {
          console.log(error);

          this.UtilsScvsb.presentToast({
            message: error.message,
            duration: 1500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-autline',
          });
        })
        .finally(() => {
          loadingsb.dismiss();
        });
    }
  }
}