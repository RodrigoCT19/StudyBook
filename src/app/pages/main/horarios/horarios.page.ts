import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service'; 
import { UtilsService } from 'src/app/services/utils.service'; 

import { map } from 'rxjs/operators';

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.page.html',
  styleUrls: ['./horarios.page.scss'],
})
export class HorariosPage implements OnInit {

  currentDateSb: Date;
  selectedSlotSb: number | null = null;
  studentNameSb: string = '';
  studentsSb: string[] = [];
  selectedSala: string = '';
  salas: string[] = [];
  isDisabledSb: boolean = false;
  timeSlotsSb: string[] = [
    '09:00 A 10:00',
    '10:00 A 11:00',
    '11:00 A 12:00',
    '12:00 A 13:00',
    '13:00 A 14:00',
    '14:00 A 15:00',
    '15:00 A 16:00',
    '16:00 A 17:00',
    '17:00 A 18:00'
  ];

  disabledSlotsSb: boolean[] = Array(this.timeSlotsSb.length).fill(false);

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { sala: string };
    if (state && state.sala) {
      this.selectedSala = state.sala;
    } else {
      // Si no se recibe la sala, redirigir al usuario a la página de selección de sala
      this.router.navigate(['/app/page/main/salas']);
    }
  }

  ngOnInit() {
    this.getCurrentDate();
    this.checkReservations();
    setInterval(() => {
      this.getCurrentDate();
    }, 86400000); // Actualizar cada día (86400000 milisegundos = 1 día)
  }

  getCurrentDate() {
    this.currentDateSb = new Date();
  }

  getDayNameSpanishSb(): string {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dayNames[this.currentDateSb.getDay()];
  }

  async checkReservations() {
    const date = this.currentDateSb.toISOString().split('T')[0]; // Obtener solo la fecha en formato yyyy-MM-dd
    for (let i = 0; i < this.timeSlotsSb.length; i++) {
      const reservations = await this.firebaseService.getReservationsByRoomAndTimeSlot(this.selectedSala, date, this.timeSlotsSb[i]);
      const isDisabledSb$ = this.firebaseService.isTimeSlotDisabled(this.selectedSala, date, this.timeSlotsSb[i]);
      isDisabledSb$.subscribe(isDisabledSb => {
        if (reservations.length > 0 || isDisabledSb) {
          this.disabledSlotsSb[i] = true;
        }
      });
    }
  }

  toggleTimeSlotSb(index: number) {
    if (this.selectedSlotSb === index) {
      this.selectedSlotSb = null;
      this.isDisabledSb = false;
    } else {
      this.selectedSlotSb = index;
      this.isDisabledSb = true;
    }
  }

  addStudentSb() {
    if (this.studentNameSb.trim() !== '' && this.studentsSb.length < 6) {
      this.studentsSb.push(this.studentNameSb);
      this.studentNameSb = '';
    }
  }

  removeStudentSb(index: number) {
    this.studentsSb.splice(index, 1);
  }

  async navigateToReservaSb() {
    if (this.selectedSlotSb !== null && this.studentsSb.length > 0) {
      const reservation = {
        sala: this.selectedSala,
        date: this.currentDateSb.toISOString().split('T')[0], // yyyy-MM-dd
        horario: this.timeSlotsSb[this.selectedSlotSb],
        studentsSb: this.studentsSb,
        timestamp: new Date().toISOString(),
      };

      try {
        // Deshabilitar el horario seleccionado
        this.disabledSlotsSb[this.selectedSlotSb] = true;

        // Guardar el estado deshabilitado en Firebase
        await this.firebaseService.disableTimeSlot(this.selectedSala, this.currentDateSb.toISOString().split('T')[0], this.timeSlotsSb[this.selectedSlotSb]);

        console.log('Reserva guardada exitosamente en Firebase');

        // Navegar a la nueva página después de guardar la reserva
        this.router.navigate(['/main/solicitudes'], {
          state: { 
            data: reservation,
            timestamp: reservation.timestamp,
            currentDateSb: reservation.date
          }
        });

      } catch (error) {
        console.error('Error al guardar la reserva en Firebase:', error);
        // Aquí puedes manejar el error, por ejemplo, mostrar una notificación al usuario
      }
    } else {
      // Mostrar una notificación o alerta de que se deben completar todos los campos
      this.utilsService.presentToast({ message: 'Por favor, selecciona una franja horaria y añade al menos un estudiante.', duration: 2000 });
    }
  }

  // Nueva función para habilitar el horario después de un retraso
  enableTimeSlotAfterDelay(slotIndex: number, delay: number) {
    setTimeout(async () => {
      this.disabledSlotsSb[slotIndex] = false;
      const date = this.currentDateSb.toISOString().split('T')[0];
      await this.firebaseService.enableTimeSlot(this.selectedSala, date, this.timeSlotsSb[slotIndex]);
    }, delay);
  }
}
