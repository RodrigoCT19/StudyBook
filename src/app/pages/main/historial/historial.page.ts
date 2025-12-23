import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  activeReservationssb: any[] = [];
  remainingHeartssb: number = 3; // Inicializar con 3 corazones

  constructor(
    private firebaseServicesb: FirebaseService,
    private utilsServicesb: UtilsService,
    private alertControllersb: AlertController,
    private routersb: Router
  ) { }

  async ngOnInit() {
    await this.loadHistorialsb();
  }

  async loadHistorialsb() {
    const userCodesb = this.utilsServicesb.getFromLocalStorage('user')?.code;
    if (!userCodesb) {
      console.error('User code not found in local storage');
      return;
    }

    try {
      const allReservationssb = await this.firebaseServicesb.getAllReservations();
      const userReservationssb = allReservationssb.filter(reservation => reservation['code'] === userCodesb);

      if (userReservationssb.length > 0) {
        const disabledSlotssb = await this.firebaseServicesb.getAllDisabledSlots();

        this.activeReservationssb = userReservationssb.map(reservation => {
          const matchingDisabledSlotsb = disabledSlotssb.find(slot =>
            slot['sala'] === reservation['sala'] &&
            slot['date'] === reservation['date'] &&
            slot['timeSlot'] === reservation['horario']
          );

          reservation['disabled'] = matchingDisabledSlotsb ? matchingDisabledSlotsb['disabled'] : undefined;
          return reservation;
        });

        const cancelledCountsb = this.activeReservationssb.filter(reservation => reservation['status'] === 'Cancelada').length;
        this.remainingHeartssb = Math.max(3 - cancelledCountsb, 0);

        if (this.remainingHeartssb <= 0) {
          await this.presentAlertsb();
        }
      } else {
        console.log('No reservations found for the user');
      }
    } catch (errorsb) {
      console.error('Error fetching reservations', errorsb);
    }
  }

  async presentAlertsb() {
    const alertsb = await this.alertControllersb.create({
      header: 'Sanción',
      message: 'Tu cuenta será sancionada debido a demasiadas reservas canceladas.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            const userEmailsb = this.utilsServicesb.getFromLocalStorage('user')?.email;
            if (userEmailsb) {
              this.liberarUsuariosb(userEmailsb);
            } else {
              console.error('User email not found in local storage');
            }
          }
        }
      ]
    });

    await alertsb.present();
  }

  liberarUsuariosb(emailsb: string) {
    this.firebaseServicesb.updateUserDisabledStatus(emailsb, true)
      .then(() => {
        console.log('Estado de usuario actualizado correctamente.');
        this.routersb.navigate(['/login']);
      })
      .catch((errorsb) => {
        console.error('Error al actualizar el estado de usuario:', errorsb);
      });
  }
}
