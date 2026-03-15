import {ChangeDetectionStrategy, Component, DestroyRef, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, filter, switchMap } from 'rxjs';
import { PortfolioService } from '../../core/services/portfolio.service';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-wallet-dashboard',
  imports: [],
  templateUrl: './wallet-dashboard.component.html',
  styleUrl: './wallet-dashboard.component.scss',
  providers: [
    PortfolioService,
    TransactionService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletDashboardComponent {
  private destroyRef = inject(DestroyRef);
  private portfolioService = inject(PortfolioService);
  private txService = inject(TransactionService);

  address$ = new BehaviorSubject<string | null>(null);
  chain$ = new BehaviorSubject<string | null>(null);

  portfolio$ = combineLatest([
    this.chain$,
    this.address$
  ]).pipe(
    filter(([c, a]) => !!c && !!a),
    switchMap(([chain, address]) =>
      this.portfolioService.getPortfolio(chain!, address!)
    ),
    takeUntilDestroyed(this.destroyRef)
  );

  transactions$ = combineLatest([
    this.chain$,
    this.address$
  ]).pipe(
    filter(([c, a]) => !!c && !!a),
    switchMap(([chain, address]) =>
      this.txService.getTransactions(address!, chain!, 10)
    ),
    takeUntilDestroyed(this.destroyRef)
  );

  load(address: string, chain: string) {
    this.address$.next(address)
    this.chain$.next(chain)
  }
}
