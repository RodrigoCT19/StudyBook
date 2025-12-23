import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service'; 
import { UtilsService } from 'src/app/services/utils.service'; 

@Component({
  selector: 'app-salas',
  templateUrl: './salas.page.html',
  styleUrls: ['./salas.page.scss'],
})
export class SalasPage implements OnInit {

  constructor(private router: Router, private firebaseService: FirebaseService) { }

  ngOnInit() {
  }

  async navigateToHorariosSb(sala: string) {
    try {
      await this.firebaseService.saveSala({ nombre: sala });
      this.router.navigate(['/main/horarios'],{
        state: { sala: sala }
      });
    } catch (error) {
      console.error("Error guardando la sala: ", error);
    }
  }
}
