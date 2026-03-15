import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChainService } from './chain.service';
import { Chain } from '../../shared/models/chain.model';
import { environment } from '../../../environments/environment';

describe('ChainService', () => {
  let service: ChainService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockChains: Chain[] = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      chainId: 1,
      nativeCurrency: { symbol: 'ETH', decimals: 18 },
      type: 'evm',
    },
    {
      id: 'solana',
      name: 'Solana',
      chainId: 101,
      nativeCurrency: { symbol: 'SOL', decimals: 9 },
      type: 'solana',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChainService],
    });
    service = TestBed.inject(ChainService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getChains() should request GET /api/chains and return chains', () => {
    service.getChains().subscribe((chains) => {
      expect(chains).toEqual(mockChains);
      expect(chains.length).toBe(2);
      expect(chains[0].id).toBe('ethereum');
      expect(chains[0].nativeCurrency.symbol).toBe('ETH');
    });

    const req = httpMock.expectOne(`${apiUrl}/chains`);
    expect(req.request.method).toBe('GET');
    req.flush(mockChains);
  });

  it('getChains() should use shareReplay (single request for multiple subscribers)', () => {
    const results: Chain[][] = [];
    service.getChains().subscribe((c) => results.push(c));
    service.getChains().subscribe((c) => {
      results.push(c);
      expect(results[0]).toEqual(results[1]);
      expect(results.length).toBe(2);
    });

    const req = httpMock.expectOne(`${apiUrl}/chains`);
    req.flush(mockChains);
  });
});
