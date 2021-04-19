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
    if (!Array.isArray(fileUrls)) {
      return throwError('argument must be array');
    }

    if (
      fileUrls.length >= 1 &&
      !fileUrls.every((url) => typeof url === 'string')
    ) {
      return throwError('array must be of type string with file urls');
    }

    return combineLatest(
      fileUrls.map((url) => this.http.get(url, { responseType: 'blob' }))
    ).pipe(
      mergeMap((res: Blob[]) => {
        let zip: JSZip = new JSZip();

        res.forEach((blob, i) => {
          const { type } = blob;
          const [fileType, fileExtension] = type.split('/');
          zip.file(`${i + 1}.${fileExtension}`, blob);
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
