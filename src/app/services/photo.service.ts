import { Injectable, signal } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export interface UserPhoto {
  /** Nombre del archivo guardado en el almacenamiento de la app */
  filepath: string;
  /** Imagen lista para mostrarse en un <img> (data URL) */
  webviewPath: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private readonly PHOTO_STORAGE = 'photos';

  public photos = signal<UserPhoto[]>([]);

  /** Toma una foto, la guarda en la app y también en la galería del teléfono. */
  public async addNewToGallery(): Promise<void> {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 85,
      width: 1600,
      correctOrientation: true,
      saveToGallery: true, // copia la foto en la galería del teléfono
    });

    if (!capturedPhoto.base64String) {
      return;
    }

    const filepath = `${Date.now()}.jpeg`;
    await Filesystem.writeFile({
      path: filepath,
      data: capturedPhoto.base64String,
      directory: Directory.Data,
    });

    this.photos.update((photos) => [
      {
        filepath,
        webviewPath: `data:image/jpeg;base64,${capturedPhoto.base64String}`,
      },
      ...photos,
    ]);

    await this.saveIndex();
  }

  /** Carga las fotos guardadas anteriormente (se llama al abrir la app). */
  public async loadSaved(): Promise<void> {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    const names: string[] = value ? JSON.parse(value) : [];

    const loaded: UserPhoto[] = [];
    for (const filepath of names) {
      try {
        const file = await Filesystem.readFile({
          path: filepath,
          directory: Directory.Data,
        });
        loaded.push({
          filepath,
          webviewPath: `data:image/jpeg;base64,${file.data}`,
        });
      } catch {
        // El archivo ya no existe: se ignora
      }
    }
    this.photos.set(loaded);
  }

  /** Elimina una foto de la galería de la app y de su almacenamiento. */
  public async deletePicture(photo: UserPhoto): Promise<void> {
    this.photos.update((photos) =>
      photos.filter((p) => p.filepath !== photo.filepath),
    );
    await this.saveIndex();

    try {
      await Filesystem.deleteFile({
        path: photo.filepath,
        directory: Directory.Data,
      });
    } catch (error) {
      console.error('No se pudo borrar el archivo', error);
    }
  }

  private async saveIndex(): Promise<void> {
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos().map((p) => p.filepath)),
    });
  }
}
