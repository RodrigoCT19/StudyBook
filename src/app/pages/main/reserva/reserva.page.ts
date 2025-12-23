import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.page.html',
  styleUrls: ['./reserva.page.scss'],
})
export class ReservaPage implements OnInit {

  salasSb: any[] = [];
  horariosSb: any[] = [];
  reservationsSb: any[] = [];
  disabledSlotsSb: any[] = [];
  latestReservationSb: any; // Mantener el estado de la última reserva

  constructor(
    private firebaseServiceSb: FirebaseService,
    private utilsServiceSb: UtilsService
  ) { }

  async ngOnInit() {
    await this.loadDataSb();
    this.listenForChangesSb(); // Escuchar cambios en las reservas
  }

  async loadDataSb() {
    try {
      this.salasSb = await this.getSalasSb();
      this.horariosSb = await this.getHorariosSb();
      const allReservationsSb = await this.firebaseServiceSb.getAllReservations();

      // Obtener el código del usuario desde el perfil del usuario
      const userCodeSb = this.utilsServiceSb.getFromLocalStorage('user')?.code;

      // Filtrar las reservas por el código del usuario
      const userReservationsSb = allReservationsSb.filter(reservation => reservation['code'] === userCodeSb);

      // Obtener la última reserva
      if (userReservationsSb && userReservationsSb.length > 0) {
        this.latestReservationSb = userReservationsSb.reduce((latest, current) => 
          new Date(current['timestamp']).getTime() > new Date(latest['timestamp']).getTime() ? current : latest
        );

        // Verificar si la reserva está cancelada
        this.loadDisabledSlotsSb();
      }

      // Verificar datos cargados
      console.log('Salas:', this.salasSb);
      console.log('Horarios:', this.horariosSb);
      console.log('Reservations:', this.reservationsSb);
    } catch (errorSb) {
      console.error('Error loading data:', errorSb);
    }
  }

  listenForChangesSb() {
    // Escuchar cambios en las reservas en tiempo real
    this.firebaseServiceSb.listenForReservationChanges().subscribe({
      next: (reservationsSb: any[]) => {
        const userCodeSb = this.utilsServiceSb.getFromLocalStorage('user')?.code;
        const userReservationsSb = reservationsSb.filter(reservation => reservation['code'] === userCodeSb);

        if (userReservationsSb && userReservationsSb.length > 0) {
          this.latestReservationSb = userReservationsSb.reduce((latest, current) => 
            new Date(current.timestamp).getTime() > new Date(latest.timestamp).getTime() ? current : latest
          );

          this.loadDisabledSlotsSb();
        }
        
        console.log('Updated Reservations:', reservationsSb);
      },
      error: (errorSb) => {
        console.error('Error listening for reservation changes:', errorSb);
      }
    });
  }

  async loadDisabledSlotsSb() {
    try {
      this.disabledSlotsSb = await this.firebaseServiceSb.getAllDisabledSlots();
      this.checkReservationStatusSb();
    } catch (errorSb) {
      console.error('Error fetching disabled slots:', errorSb);
    }
  }

  checkReservationStatusSb() {
    console.log('Latest reservation:', this.latestReservationSb);
    console.log('Disabled slots:', this.disabledSlotsSb);

    if (this.latestReservationSb && this.disabledSlotsSb.length > 0) {
      const isCancelledSb = this.disabledSlotsSb.some(slotSb =>
        slotSb.sala === this.latestReservationSb.sala &&
        slotSb.date === this.latestReservationSb.date &&
        slotSb.timeSlot === this.latestReservationSb.horario &&
        slotSb.disabled
      );
      this.latestReservationSb.disabled = isCancelledSb;
    }

    console.log('After checking:', this.latestReservationSb);
  }

  async getSalasSb() {
    // Implementa la lógica para obtener las salas
    return await this.firebaseServiceSb.getAllSalassb();
  }

  async getHorariosSb() {
    // Implementa la lógica para obtener los horarios
    return await this.firebaseServiceSb.getAllHorariossb();
  }

}
