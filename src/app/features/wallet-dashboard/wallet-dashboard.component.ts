import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, concatWith, filter, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PortfolioService } from '../../core/services/portfolio.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Portfolio } from '../../shared/models/portfolio.model';
import { Transaction } from '../../shared/models/transaction.model';
import { WalletAddressFormComponent, WalletFormValue } from './wallet-address-form/wallet-address-form.component';
import {
  formatBalance as formatBalanceUtil,
  formatUsd as formatUsdUtil,
} from '../../shared/utils/balance.util';
import { CommonModule } from '@angular/common';
import {
  formatTxDate as formatTxDateUtil,
  shortHash as shortHashUtil,
} from '../../shared/utils/format.util';

export type PortfolioState =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'loaded'; data: Portfolio }
  | { state: 'error'; message: string };

export type TransactionsState =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'loaded'; data: Transaction[] }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-wallet-dashboard',
  imports: [CommonModule, WalletAddressFormComponent],
  templateUrl: './wallet-dashboard.component.html',
  styleUrl: './wallet-dashboard.component.scss',
  providers: [PortfolioService, TransactionService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletDashboardComponent {
  private destroyRef = inject(DestroyRef);
  private portfolioService = inject(PortfolioService);
  private txService = inject(TransactionService);

  private address$ = new BehaviorSubject<string | null>(null);
  private chain$ = new BehaviorSubject<string | null>(null);

  /** True when user has submitted address + chain and we show portfolio/tx sections. */
  showResults$ = combineLatest([this.chain$, this.address$]).pipe(
    map(([c, a]) => !!c && !!a),
    takeUntilDestroyed(this.destroyRef)
  );

  private loadTrigger$ = combineLatest([this.chain$, this.address$]).pipe(
    filter(([c, a]) => !!c && !!a),
    takeUntilDestroyed(this.destroyRef)
  );

  portfolioState$ = this.loadTrigger$.pipe(
    switchMap(([chain, address]) =>
      of<PortfolioState>({ state: 'loading' }).pipe(
        concatWith(
          this.portfolioService.getPortfolio(chain!, address!).pipe(
            map((data) => ({ state: 'loaded' as const, data })),
            catchError((err) =>
              of({
                state: 'error' as const,
                message: err?.message || err?.error?.message || 'Ошибка загрузки портфолио',
              })
            )
          )
        )
      )
    ),
    takeUntilDestroyed(this.destroyRef)
  );

  transactionsState$ = this.loadTrigger$.pipe(
    switchMap(([chain, address]) =>
      of<TransactionsState>({ state: 'loading' }).pipe(
        concatWith(
          this.txService.getTransactions(address!, chain!, 10).pipe(
            map((data) => ({ state: 'loaded' as const, data: data ?? [] })),
            catchError((err) =>
              of({
                state: 'error' as const,
                message: err?.message || err?.error?.message || 'Ошибка загрузки транзакций',
              })
            )
          )
        )
      )
    ),
    takeUntilDestroyed(this.destroyRef)
  );

  onFormSubmit(value: WalletFormValue): void {
    this.address$.next(value.address.trim());
    this.chain$.next(value.chainId);
  }

  formatBalance(rawBalance: string, decimals: number): string {
    return formatBalanceUtil(rawBalance, decimals);
  }

  formatUsd(value: number): string {
    return formatUsdUtil(value);
  }

  shortHash(hash: string): string {
    return shortHashUtil(hash);
  }

  formatTxDate(timestamp: number): string {
    return formatTxDateUtil(timestamp);
  }
}
