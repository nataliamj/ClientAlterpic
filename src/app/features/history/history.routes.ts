import { Routes } from '@angular/router';

export const historyRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./components/history-list/history-list.component').then(m => m.HistoryListComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./components/history-detail/history-detail.component').then(m => m.HistoryDetailComponent)
      }
    ]
  }
];