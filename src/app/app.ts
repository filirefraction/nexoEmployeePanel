import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaStatusCenterComponent } from './core/pwa/components/pwa-status-center.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaStatusCenterComponent],
  templateUrl: './app.html',
})
export class App {}

