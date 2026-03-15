import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as USD with 2 decimals (e.g. $1,234.56).
 *
 * Usage: {{ value | formatUsd }}
 */
@Pipe({
  name: 'formatUsd',
  standalone: true,
})
export class FormatUsdPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(0);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
