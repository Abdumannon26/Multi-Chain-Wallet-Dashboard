import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WalletDashboardComponent} from './features/wallet-dashboard/wallet-dashboard.component';

@Component({
  selector: 'app-root',
  imports: [WalletDashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('multi-chain-wallet-dashboard');
}
