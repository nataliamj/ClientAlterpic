import { Routes } from '@angular/router';
import { imagesRoutes } from './features/images/images.routes';

export const routes: Routes = [
    { 
        path: 'home', 
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) 
    },
    { 
        path: 'auth', 
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },

    {
        path: 'images',
        loadChildren:() => import('./features/images/images.routes').then(m => m.imagesRoutes)
    },

    {
    path: 'history', 
    loadChildren:() => import('./features/history/history.routes').then(m => m.historyRoutes),
   },

    { 
        path: '', 
        redirectTo: 'home', 
        pathMatch: 'full' 
    },
    { 
        path: '**', 
        redirectTo: 'home' 
    }
];