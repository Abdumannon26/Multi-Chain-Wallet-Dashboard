import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Transaction } from '../../../shared/models/transaction.model';
import {
  formatTxDate as formatTxDateUtil,
  shortHash as shortHashUtil,
} from '../../../shared/utils/format.util';

export type TransactionsState =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'loaded'; data: Transaction[] }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('contentFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('loadingFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class TransactionListComponent {
  state$ = input.required<Observable<TransactionsState>>();

  readonly displayedColumns = ['hash', 'from', 'to', 'value', 'date'] as const;

  shortHash(hash: string): string {
    return shortHashUtil(hash);
  }

  formatTxDate(timestamp: number): string {
    return formatTxDateUtil(timestamp);
  }
}
