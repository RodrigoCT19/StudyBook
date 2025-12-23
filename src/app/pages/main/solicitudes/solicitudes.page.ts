import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
})
export class SolicitudesPage implements OnInit, OnDestroy {

  sala: string;
  horario: string;
  students: string[];
  date: string;
  timestamp: string;
  user: { email: string, name: string, code: string } = { email: '', name: '', code: '' };
  status: 'Activo' | 'Cancelado' | 'Culminado' = 'Activo'; // Default status

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private firebaseService: FirebaseService,
    private utilsService: UtilsService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any, timestamp: string, currentDate: string };
    if (state) {
      this.sala = state.data.sala;
      this.horario = state.data.horario;
      this.students = state.data.students;
      this.date = state.currentDate;
      this.timestamp = state.timestamp;
    }
  }

  async ngOnInit() {
    const storedUser = this.utilsService.getFromLocalStorage('user');
    if (storedUser && storedUser.email) {
      await this.loadUserByEmail(storedUser.email);
    }
    this.menuCtrl.enable(false); // Desactiva el menú cuando la página de solicitudes está activa
  }

  async loadUserByEmail(email: string) {
    try {
      const userArray = await this.firebaseService.getUserByEmail(email);
      if (userArray && userArray.length > 0) {
        this.user = userArray[0];
      } else {
        console.error('Usuario no encontrado');
        this.utilsService.presentToast({ message: 'Usuario no encontrado', duration: 2000 });
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
      this.utilsService.presentToast({ message: 'Error al cargar el usuario', duration: 2000 });
    }
  }

  finalizar() {
    const reservation = {
      sala: this.sala,
      horario: this.horario,
      students: this.students,
      date: this.date,
      timestamp: this.timestamp,
      code: this.user.code,  // Agregar el campo 'code' del usuario actual
      status: this.status // Agregar el estado de la reserva
    };

    this.firebaseService.saveReservation(reservation)
      .then(() => {
        this.utilsService.presentToast({ message: 'Reserva guardada correctamente', duration: 2000 });
        this.router.navigate(['main/salas']); // Redirigir a la página principal de salas
        this.menuCtrl.enable(true); // Vuelve a activar el menú al redirigir
      })
      .catch(error => {
        console.error('Error al guardar la reserva:', error);
        this.utilsService.presentToast({ message: 'Error al guardar la reserva', duration: 2000 });
        this.menuCtrl.enable(true); // Vuelve a activar el menú en caso de error
      });
  }

  ngOnDestroy() {
    this.menuCtrl.enable(true); // Asegúrate de habilitar el menú cuando se destruye la página
  }
}
