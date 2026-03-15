import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, shareReplay} from 'rxjs';
import {Chain} from '../../shared/models/chain.model';
import {environment} from '../../../environments/environment';


@Injectable()
export class ChainService {

  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  getChains(): Observable<Chain[]> {
    return this.http.get<Chain[]>(`${this.apiUrl}/chains`)
      .pipe(
        shareReplay(1)
      )
  }
}
