import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import { AuthInterceptor } from './core/http/auth.interceptor';
import { CorrelationIdInterceptor } from './core/http/correlation-id.interceptor';
import NexoPrimePreset from './core/platform/nexo-prime-preset';
import { CurrentSessionService } from './core/session/current-session.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(withInterceptorsFromDi()),
    providePrimeNG({
      theme: {
        preset: NexoPrimePreset,
        options: {
          darkModeSelector: false
        }
      },
      ripple: false,
            translation: {
        startsWith: 'Comienza con',
        contains: 'Contiene',
        notContains: 'No contiene',
        endsWith: 'Termina con',
        equals: 'Igual a',
        notEquals: 'Distinto de',
        noFilter: 'Sin filtro',
        lt: 'Menor que',
        lte: 'Menor o igual que',
        gt: 'Mayor que',
        gte: 'Mayor o igual que',
        dateIs: 'La fecha es',
        dateIsNot: 'La fecha no es',
        dateBefore: 'Antes de',
        dateAfter: 'Después de',
        clear: 'Limpiar',
        apply: 'Aplicar',
        matchAll: 'Cumplir todas',
        matchAny: 'Cumplir cualquiera',
        addRule: 'Agregar regla',
        removeRule: 'Quitar regla',
        accept: 'Aceptar',
        reject: 'Cancelar',
        choose: 'Seleccionar',
        upload: 'Subir',
        cancel: 'Cancelar',
        dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        monthNames: [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre'
        ],
        monthNamesShort: [
          'ene',
          'feb',
          'mar',
          'abr',
          'may',
          'jun',
          'jul',
          'ago',
          'sep',
          'oct',
          'nov',
          'dic'
        ],
        dateFormat: 'dd/mm/yy',
        firstDayOfWeek: 1,
        today: 'Hoy',
        weekHeader: 'Sem'
      }
    }),
    provideAppInitializer(() => inject(CurrentSessionService).initialize()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CorrelationIdInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-MX'
    }
  ]
};
