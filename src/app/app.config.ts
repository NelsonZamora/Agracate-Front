import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter,Routes } from '@angular/router';

// import { routes } from './app.routes';

import { Monitoreo } from './monitoreo/monitoreo';
import { Inventario } from './inventario/inventario';
import { Informes } from './informes/informes';
import { Navbar } from './navbar/navbar';

const routes: Routes = [
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
