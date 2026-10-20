import { Component, OnInit } from '@angular/core';
import {
  ActionSheetController,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, close, trash } from 'ionicons/icons';
import { PhotoService, UserPhoto } from '../services/photo.service';

@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery.page.html',
  styleUrls: ['gallery.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonImg,
    IonFab, IonFabButton, IonIcon,
  ],
})
export class GalleryPage implements OnInit {
  constructor(
    public photoService: PhotoService,
    private actionSheetController: ActionSheetController,
  ) {
    addIcons({ camera, trash, close });
  }

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  async addPhotoToGallery() {
    try {
      await this.photoService.addNewToGallery();
    } catch (error) {
      // El usuario canceló o negó el permiso de cámara
      console.error('No se tomó la foto', error);
    }
  }

  async showActionSheet(photo: UserPhoto) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Foto',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.photoService.deletePicture(photo);
          },
        },
        { text: 'Cancelar', icon: 'close', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }
}
