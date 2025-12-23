import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  loadingCtrl: LoadingController;
  toastCtrl: ToastController;
  router: Router;

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private routerService: Router
  ) {
    this.loadingCtrl = loadingController;
    this.toastCtrl = toastController;
    this.router = routerService;
  }

  async loading() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    return loading;
  }

  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  routink(url: string) {
    return this.router.navigateByUrl(url);
  }

  removeCircularReferences(obj: any, seen: WeakSet<any> = new WeakSet()): any {
    if (obj !== null && typeof obj === 'object') {
      if (seen.has(obj)) {
        return undefined;
      }
      seen.add(obj);

      if (Array.isArray(obj)) {
        return obj.map(item => this.removeCircularReferences(item, seen));
      }

      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        newObj[key] = this.removeCircularReferences(obj[key], seen);
      }
      return newObj;
    }
    return obj;
  }

  saveInLocalStorage(key: string, value: any) {
    try {
      const valueWithoutCircularReferences = this.removeCircularReferences(value);
      localStorage.setItem(key, JSON.stringify(valueWithoutCircularReferences));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getFromLocalStorage(key: string) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  removeFromLocalStorage(key: string) {
    localStorage.removeItem(key);
  }
}
