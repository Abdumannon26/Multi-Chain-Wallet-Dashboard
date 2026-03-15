import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio } from '../../shared/models/portfolio.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class PortfolioService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getPortfolio(chain: string, address: string): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.apiUrl}/portfolio/${address}`, {
      params: { chain },
    });
  }
}
