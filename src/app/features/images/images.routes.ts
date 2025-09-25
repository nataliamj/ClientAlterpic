import { Routes } from '@angular/router';

export const imagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'upload',
        pathMatch: 'full'
      },
      {
        path: 'upload',
        loadComponent: () => import('./components/upload/upload.component').then(m => m.UploadComponent)
      },
      {
        path: 'configure',
        loadComponent: () => import('./components/transform/transform.component').then(m => m.TransformComponent)
      },
      {
        path: 'download',
        loadComponent: () => import('./components/download/download.component').then(m => m.DownloadComponent)
      }
    ]
  }
];