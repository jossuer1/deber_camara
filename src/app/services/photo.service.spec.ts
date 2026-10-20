import { TestBed } from '@angular/core/testing';
import { PhotoService } from './photo.service';

describe('PhotoService', () => {
  it('should be created with an empty gallery', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(PhotoService);
    expect(service).toBeTruthy();
    expect(service.photos().length).toBe(0);
  });
});
