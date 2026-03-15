import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, concatWith, filter, merge, of, switchMap, withLatestFrom } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { PortfolioService } from '../../core/services/portfolio.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Portfolio } from '../../shared/models/portfolio.model';
import { Transaction } from '../../shared/models/transaction.model';
import { WalletAddressFormComponent, WalletFormValue } from './wallet-address-form/wallet-address-form.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { FormatBalancePipe } from '../../shared/pipes/format-balance.pipe';
import { FormatUsdPipe } from '../../shared/pipes/format-usd.pipe';

/** Интервал автообновления баланса и транзакций (мс). */
const REFRESH_INTERVAL_MS = 30_000;

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

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && typeof body.message === 'string') return body.message;
    if (err.status === 0) return 'Сеть недоступна. Проверьте подключение.';
    if (err.status >= 500) return 'Ошибка сервера. Попробуйте позже.';
    if (err.status >= 400) return (body && typeof body === 'object' && body.message) ? String(body.message) : (err.message || fallback);
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

@Component({
  selector: 'app-wallet-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTableModule,
    WalletAddressFormComponent,
    TransactionListComponent,
    FormatBalancePipe,
    FormatUsdPipe,
  ],
  providers: [PortfolioService, TransactionService],
  templateUrl: './wallet-dashboard.component.html',
  styleUrl: './wallet-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('contentFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition('* => *', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 })),
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
export class WalletDashboardComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly portfolioService = inject(PortfolioService);
  private readonly txService = inject(TransactionService);

  private readonly address$ = new BehaviorSubject<string | null>(null);
  private readonly chain$ = new BehaviorSubject<string | null>(null);

  readonly showResults$ = combineLatest([this.chain$, this.address$]).pipe(
    map(([c, a]) => !!c && !!a),
    takeUntilDestroyed(this.destroyRef)
  );

  private readonly loadTrigger$ = combineLatest([this.chain$, this.address$]).pipe(
    filter((tuple): tuple is [string, string] => !!tuple[0] && !!tuple[1]),
    takeUntilDestroyed(this.destroyRef)
  );

  private readonly refreshTrigger$: Observable<[string, string]> = merge(
    this.loadTrigger$,
    timer(REFRESH_INTERVAL_MS, REFRESH_INTERVAL_MS).pipe(
      withLatestFrom(this.chain$, this.address$),
      filter(([, c, a]) => !!c && !!a),
      map(([, c, a]) => [c, a] as [string, string])
    )
  ).pipe(takeUntilDestroyed(this.destroyRef));

  readonly portfolioState$: Observable<PortfolioState> = this.refreshTrigger$.pipe(
    switchMap(([chain, address]: [string, string]) =>
      of<PortfolioState>({ state: 'loading' }).pipe(
        concatWith(
          this.portfolioService.getPortfolio(chain, address).pipe(
            map((data) => ({ state: 'loaded' as const, data })),
            catchError((err) =>
              of({
                state: 'error' as const,
                message: getErrorMessage(err, 'Ошибка загрузки портфолио'),
              })
            )
          )
        )
      )
    ),
    shareReplay(1),
    takeUntilDestroyed(this.destroyRef)
  );

  readonly transactionsState$: Observable<TransactionsState> = this.refreshTrigger$.pipe(
    switchMap(([chain, address]: [string, string]) =>
      of<TransactionsState>({ state: 'loading' }).pipe(
        concatWith(
          this.txService.getTransactions(address, chain, 10).pipe(
            map((data) => ({ state: 'loaded' as const, data: data ?? [] })),
            catchError((err) =>
              of({
                state: 'error' as const,
                message: getErrorMessage(err, 'Ошибка загрузки транзакций'),
              })
            )
          )
        )
      )
    ),
    shareReplay(1),
    takeUntilDestroyed(this.destroyRef)
  );

  onFormSubmit(value: WalletFormValue): void {
    this.address$.next(value.address.trim());
    this.chain$.next(value.chainId);
  }
}
