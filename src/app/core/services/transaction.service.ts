import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../../shared/models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class TransactionService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getTransactions(address: string, chain: string, limit = 10): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/${address}`, {
      params: { chain, limit: limit.toString() },
    });
  }
}
