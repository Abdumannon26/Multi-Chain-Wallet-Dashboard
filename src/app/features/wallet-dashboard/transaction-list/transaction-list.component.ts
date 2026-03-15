import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from '../../../shared/models/transaction.model';
import {
  formatTxDate as formatTxDateUtil,
  shortHash as shortHashUtil,
} from '../../../shared/utils/format.util';
import { CommonModule } from '@angular/common';

export type TransactionsState =
  | { state: 'loading' }
  | { state: 'loaded'; data: Transaction[] }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent {
  /** Stream of loading / loaded / error state. */
  state$ = input.required<Observable<TransactionsState>>();

  shortHash(hash: string): string {
    return shortHashUtil(hash);
  }

  formatTxDate(timestamp: number): string {
    return formatTxDateUtil(timestamp);
  }
}
