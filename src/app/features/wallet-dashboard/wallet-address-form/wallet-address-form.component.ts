import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChainService } from '../../../core/services/chain.service';
import { Chain } from '../../../shared/models/chain.model';
import { validateAddress } from '../../../shared/utils/address.util';

export interface WalletFormValue {
  chainId: string;
  address: string;
}

@Component({
  selector: 'app-wallet-address-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './wallet-address-form.component.html',
  styleUrl: './wallet-address-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChainService],
})
export class WalletAddressFormComponent {
  private destroyRef = inject(DestroyRef);
  private chainService = inject(ChainService);
  private fb = inject(NonNullableFormBuilder);

  submitForm = output<WalletFormValue>();

  chains = signal<Chain[]>([]);

  form = this.fb.group({
    chainId: this.fb.control<string>('', Validators.required),
    address: this.fb.control<string>('', Validators.required),
  });

  constructor() {
    this.chainService
      .getChains()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => {
        this.chains.set(list);
        if (list.length > 0 && !this.form.controls.chainId.value) {
          this.form.controls.chainId.setValue(list[0].id);
        }
      });
  }

  onSubmit(): void {
    const chainId = this.form.controls.chainId.value.trim();
    const address = this.form.controls.address.value.trim();

    this.form.controls.chainId.setErrors(null);
    this.form.controls.address.setErrors(null);

    if (!chainId) {
      this.form.controls.chainId.setErrors({ required: true });
      return;
    }

    const chain = this.chains().find((c) => c.id === chainId);
    const chainType = chain?.type?.toLowerCase() ?? 'evm';
    const validation = validateAddress(
      address,
      chainType === 'solana' ? 'solana' : undefined
    );

    if (!validation.valid) {
      this.form.controls.address.setErrors({
        invalidAddress: validation.error ?? 'Неверный адрес',
      });
      this.form.controls.address.markAsTouched();
      return;
    }

    this.submitForm.emit({ chainId, address });
  }
}
