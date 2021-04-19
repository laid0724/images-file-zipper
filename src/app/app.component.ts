import { Component } from '@angular/core';
import { DownloaderService } from './services/downloader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  fileUrls: string[] = [
    'https://dogecoin.org/static/11cf6c18151cbb22c6a25d704ae7b313/dd8fa/doge-main.jpg',
    'https://s.yimg.com/ny/api/res/1.2/o7Vlb4oSNIZKnW6w282Vew--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTY0MA--/https://s.yimg.com/uu/api/res/1.2/Hwxk3qkm.UgiyJSNP9yiaQ--~B/aD00MDA7dz02MDA7YXBwaWQ9eXRhY2h5b24-/https://media.zenfs.com/en/Benzinga/d94ea80299260cb3a7e408d7b35f4c5e',
  ];

  constructor(private downloaderService: DownloaderService) {}

  downloadImages(): void {
    this.downloaderService.onSaveAsZip(this.fileUrls).subscribe();
  }
}
