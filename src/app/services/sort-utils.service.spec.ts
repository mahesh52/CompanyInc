import { TestBed } from '@angular/core/testing';

import { SortUtilsService } from './sort-utils.service';

describe('SortUtilsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SortUtilsService = TestBed.get(SortUtilsService);
    expect(service).toBeTruthy();
  });
});
