import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, from, Observable, throwError } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

import { FileSaverService } from 'ngx-filesaver';
import * as JSZip from 'jszip';

@Injectable({
  providedIn: 'root',
})
export class DownloaderService {
  constructor(
    private http: HttpClient,
    private fileSaverService: FileSaverService
  ) {}

  onSaveAsZip(fileUrls: string[]): Observable<any> {
    if (
      !Array.isArray(fileUrls) ||
      fileUrls.length < 1 ||
      !fileUrls.every((url) => typeof url === 'string')
    ) {
      console.error('string array with file urls required');
      return throwError('string array with file urls required');
    }

    return combineLatest(
      fileUrls.map((url) => this.http.get(url, { responseType: 'blob' }))
    ).pipe(
      mergeMap((res: Blob[]) => {
        let zip: JSZip = new JSZip();

        res.forEach((blob, i) => {
          zip.file(`${i + 1}.${blob.type.split('/')[1]}`, blob);
        });

        return from(zip.generateAsync({ type: 'blob' })).pipe(
          tap((zipBlob: Blob) => {
            this.fileSaverService.save(zipBlob, 'images.zip');
          })
        );
      })
    );
  }
}
