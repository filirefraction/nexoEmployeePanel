import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface AuthHighlight {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-auth-shell',
  imports: [RouterOutlet],
  templateUrl: './auth-shell.component.html',
})
export class AuthShellComponent {
  protected readonly highlights: readonly AuthHighlight[] = [
    {
      icon: 'pi pi-clock',
      title: 'Asistencia al momento',
      description: 'Consulta tu jornada y registra tus movimientos en pocos pasos.'
    },
    {
      icon: 'pi pi-calendar',
      title: 'Vacaciones claras',
      description: 'Da seguimiento a solicitudes, saldos y respuestas sin salir del portal.'
    },
    {
      icon: 'pi pi-mobile',
      title: 'Pensado como app',
      description: 'Experiencia ligera, móvil y lista para evolucionar como PWA.'
    }
  ];
}

