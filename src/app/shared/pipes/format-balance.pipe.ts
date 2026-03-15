import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'formatBalance',
  standalone: true,
})
export class FormatBalancePipe implements PipeTransform {
  transform(rawBalance: string, decimals: number): string {
    if (rawBalance == null || rawBalance === '' || decimals == null) {
      return '0';
    }
    try {
      const raw = BigInt(rawBalance);
      const divisor = BigInt(10 ** decimals);
      const whole = raw / divisor;
      const fraction = raw % divisor;
      const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, decimals);
      const combined = fractionStr ? `${whole}.${fractionStr}` : whole.toString();
      const num = parseFloat(combined);
      const fixed = num.toFixed(6);
      const trimmed = parseFloat(fixed).toString();
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      }).format(parseFloat(trimmed));
    } catch {
      return '0';
    }
  }
}
