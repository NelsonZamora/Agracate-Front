import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter,Routes } from '@angular/router';

// import { routes } from './app.routes';

import { Monitoreo } from './monitoreo/monitoreo';
import { Inventario } from './inventario/inventario';
import { Informes } from './informes/informes';
import { Navbar } from './navbar/navbar';
import { Tendencias } from './tendencias/tendencias';

const routes: Routes = [
  { path: '', redirectTo: '/tendencias', pathMatch: 'full' },
  { path: 'tendencias', component: Tendencias }, // Route for the charts page
  { path: 'Monitoreo', component: Monitoreo },
  { path: 'Inventario', component: Inventario },
  { path: 'Informes', component: Informes }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
