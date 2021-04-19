import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, from, Observable, of, throwError } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

import { FileSaverService } from 'ngx-filesaver';
import * as JSZip from 'jszip';

interface BlobWithFileName {
  fileName: string;
  blob: Blob;
}

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
      !fileUrls.every((url: string) => typeof url === 'string')
    ) {
      return throwError('array must be of type string with file urls');
    }

    return combineLatest(
      fileUrls.map((url: string) =>
        this.http.get(url, { responseType: 'blob' }).pipe(
          map((blob: Blob) => ({
            // @ts-ignore
            // see: https://www.encodedna.com/javascript/how-to-get-the-filename-from-url-in-javascript.htm
            fileName: url.split('/').pop().split('?')[0].split('#')[0],
            blob: blob,
          }))
        )
      )
    ).pipe(
      mergeMap((res: BlobWithFileName[]) => {
        let zip: JSZip = new JSZip();

        res.forEach((blobWithFileName: BlobWithFileName) => {
          const { fileName, blob } = blobWithFileName;
          const { type } = blob;
          const [fileType, fileExtension] = type.split('/');

          const fileNameWithoutExtension = fileName.includes('.')
            ? fileName.split('.')[0]
            : fileName;

          zip.folder(fileNameWithoutExtension);
          zip.file(
            `${fileNameWithoutExtension}/${fileNameWithoutExtension}.${fileExtension}`,
            blob
          );
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
