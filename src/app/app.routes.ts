import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./gallery/gallery.page').then((m) => m.GalleryPage),
  },
];
