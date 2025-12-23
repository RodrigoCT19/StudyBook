import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { User, Users } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs, updateDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DisabledSlot {
  sala: string;
  date: string;
  timeSlot: string;
  disabled: boolean;
  timestamp: string; // Add timestamp field
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  login = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  // ====================== Autenticación ====================
  async signIn(user: User) {
    try {
      const userCredential = await signInWithEmailAndPassword(getAuth(), user.email, user.password);
      const userData = await this.getUserByEmail(user.email);
      this.utilsSvc.saveInLocalStorage('user', userData);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }
  
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routink('/login');
  }

  sendRecoveryEmail(email: string){
    return sendPasswordResetEmail(getAuth(), email);
  }

  // ========================= Base de Datos ==================
  setDocument(path: string, data: any){
    return setDoc(doc(getFirestore(), path), data);
  }

  async getDocument(path: string){
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  updateUserDisabledStatus(email: string, disabled: boolean): Promise<void> {
    return this.firestore.collection('users', ref => ref.where('email', '==', email))
      .get().toPromise()
      .then(querySnapshot => {
        if (querySnapshot.size > 0) {
          const doc = querySnapshot.docs[0];
          return doc.ref.update({ disabled: disabled });
        } else {
          throw new Error(`No se encontró ningún usuario con el email ${email}`);
        }
      });
  }

  async saveSala(sala: { nombre: string }) {
    const path = `salas/${sala.nombre}`;
    return this.setDocument(path, sala);
  }

  async saveHorario(horario: { nombre: string }) {
    const path = `horario/${horario.nombre}`;
    return this.setDocument(path, horario);
  }

  async saveReservation(reservation: any) {
    const id = this.firestore.createId();
    const path = `reservations/${id}`;
  
    return this.setDocument(path, reservation);
  }

  async getAllSalassb() {
    const snapshot = await getDocs(collection(getFirestore(), 'salas'));
    return snapshot.docs.map(doc => doc.data());
  }

  async getAllHorariossb() {
    const snapshot = await getDocs(collection(getFirestore(), 'horario'));
    return snapshot.docs.map(doc => doc.data());
  }

  async disableTimeSlot(sala: string, date: string, timeSlot: string): Promise<void> {
    const disableRef = this.firestore.collection('disabledSlots').doc(`${sala}_${date}_${timeSlot}`);
    await disableRef.set({ sala, date, timeSlot, disabled: true, timestamp: '' });
  }

  isTimeSlotDisabled(sala: string, date: string, timeSlot: string): Observable<boolean> {
    const disableRef = this.firestore.collection('disabledSlots').doc<DisabledSlot>(`${sala}_${date}_${timeSlot}`);
    return disableRef.get().pipe(
      map(doc => {
        const data = doc.data();
        return doc.exists && data ? data.disabled === true : false;
      })
    );
  }

  async enableTimeSlot(sala: string, date: string, timeSlot: string): Promise<void> {
    const enableRef = this.firestore.collection('disabledSlots').doc(`${sala}_${date}_${timeSlot}`);
    await enableRef.set({ sala, date, timeSlot, disabled: false, timestamp: '' });
  }

  async getAllReservations() {
    const snapshot = await getDocs(collection(getFirestore(), 'reservations'));
    return snapshot.docs.map(doc => doc.data());
  }

  async getReservationsByRoomAndTimeSlot(sala: string, date: string, timeSlot: string) {
    const q = query(
      collection(getFirestore(), 'reservations'), 
      where('sala', '==', sala),
      where('date', '==', date),
      where('timeSlot', '==', timeSlot)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }

  async getUserByEmail(email: string): Promise<Users[]> {
    const snapshot = await this.firestore.collection('users', ref => ref.where('email', '==', email)).get().toPromise();
    return snapshot.docs.map(doc => doc.data() as Users);
  }

  async getUsers(): Promise<{ email: string, name: string }[]> {
    const snapshot = await this.firestore.collection('users').get().toPromise();
    return snapshot.docs.map(doc => doc.data() as { email: string, name: string });
  }

  saveUser(user: User) {
    return setDoc(doc(getFirestore(), `users/${user.email}`), user);
  }
  
  listenForReservationChanges(): Observable<any[]> {
    // Escuchar cambios en la colección 'reservations' en tiempo real con Firestore
    return this.firestore.collection<any>('reservations').valueChanges();
  }

  async getAllDisabledSlots(): Promise<DisabledSlot[]> {
    const snapshot = await getDocs(collection(getFirestore(), 'disabledSlots'));
    return snapshot.docs.map(doc => doc.data() as DisabledSlot);
  }

  // ======================== Nuevas Funcionalidades =======================

  async enableUser(email: string): Promise<void> {
    const userRef = this.firestore.collection('users').doc(email);
    await userRef.update({ enabled: true });
  }
  async checkReservationInDisabledSlots(reservation: any): Promise<boolean> {
    try {
      const { sala, date, timeSlot } = reservation;

      const disabledSlotsQuery = query(
        collection(getFirestore(), 'disabledSlots'),
        where('sala', '==', sala),
        where('date', '==', date),
        where('timeSlot', '==', timeSlot)
      );

      const disabledSlotsSnapshot = await getDocs(disabledSlotsQuery);

      return !disabledSlotsSnapshot.empty; // Retorna true si se encuentra al menos una coincidencia
    } catch (error) {
      console.error('Error checking reservation in disabledSlots:', error);
      throw error;
    }
  }

  //----------
  async updateDisabledSlotTimestamp(reservation: any): Promise<void> {
    try {
      const { sala, date, timeSlot } = reservation;
  
      // Obtener la referencia al documento en la colección 'disabledSlots'
      const disabledSlotRef = doc(this.firestore.firestore, `disabledSlots/${sala}_${date}_${timeSlot}`);
  
      const reservationQuery = query(
        collection(getFirestore(), 'reservations'),
        where('sala', '==', sala),
        where('date', '==', date),
        where('timeSlot', '==', timeSlot)
      );
  
      const reservationSnapshot = await getDocs(reservationQuery);
  
      if (!reservationSnapshot.empty) {
        const reservationData = reservationSnapshot.docs[0].data();
        const reservationTimestamp = reservationData['timestamp']; // Obtener el timestamp de la reserva
  
        // Actualizar el documento en 'disabledSlots' con el timestamp de la reserva
        await updateDoc(disabledSlotRef, { timestamp: reservationTimestamp });
      }
    } catch (error) {
      console.error('Error updating disabled slot timestamp:', error);
      throw error;
    }
  }
  sendRecoveryEmailsb(emailsb: string) {
    return sendPasswordResetEmail(getAuth(), emailsb);
  }
  
}
