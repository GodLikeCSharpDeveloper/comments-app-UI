import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageProcessor {
  processImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob | null> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              blob => {
                resolve(blob);
              },
              file.type,
              1
            );
          } else {
            resolve(null);
          }
        };
      };
      reader.readAsDataURL(file);
    });
  }
}
