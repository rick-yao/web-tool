import imageCompression from 'browser-image-compression';
import { ref } from 'vue';

export interface ProcessedFile {
  file: File;
  type: 'webp' | 'avif' | 'original';
  url: string; // Local preview URL or final URL placeholder
}

export interface ProcessingResult {
  originalName: string;
  timestamp: number;
  files: ProcessedFile[];
}

export function useImageProcessor() {
  const isProcessing = ref(false);
  const error = ref<string | null>(null);

  const checkAvifSupport = async (): Promise<boolean> => {
    if (!('HTMLCanvasElement' in window)) return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(!!blob);
      }, 'image/avif');
    });
  };

  const convertToFormat = async (
    file: File,
    format: 'image/webp' | 'image/avif',
    quality = 0.8,
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error(`Failed to convert to ${format}`));
              return;
            }
            const extension = format.split('/')[1];
            const newName = `${file.name.replace(/\.[^/.]+$/, '')}.${extension}`;
            resolve(new File([blob], newName, { type: format }));
          },
          format,
          quality,
        );
      };
      img.onerror = (e) => reject(e);
      img.src = URL.createObjectURL(file);
    });
  };

  const processImage = async (file: File): Promise<ProcessingResult> => {
    isProcessing.value = true;
    error.value = null;
    const timestamp = Math.floor(Date.now() / 1000);
    const slugName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    try {
      const results: ProcessedFile[] = [];

      // 1. WebP
      try {
        const webpFile = await convertToFormat(file, 'image/webp', 0.8);
        // Rename with timestamp
        const finalWebPName = `${slugName}_${timestamp}.webp`;
        results.push({
          file: new File([webpFile], finalWebPName, { type: 'image/webp' }),
          type: 'webp',
          url: URL.createObjectURL(webpFile),
        });
      } catch (e) {
        console.error('WebP conversion failed', e);
      }

      // 2. AVIF
      const avifSupported = await checkAvifSupport();
      if (avifSupported) {
        try {
          const avifFile = await convertToFormat(file, 'image/avif', 0.8);
          const finalAvifName = `${slugName}_${timestamp}.avif`;
          results.push({
            file: new File([avifFile], finalAvifName, { type: 'image/avif' }),
            type: 'avif',
            url: URL.createObjectURL(avifFile),
          });
        } catch (e) {
          console.error('AVIF conversion failed', e);
        }
      }

      // 3. Compressed Original
      try {
        const options = {
          maxSizeMB: 1, // Target 1MB or similar? Requirements say "compress to reduce size", not specific target.
          useWebWorker: true,
          initialQuality: 0.8,
        };
        const compressedBlob = await imageCompression(file, options);
        const ext = file.name.split('.').pop();
        const finalOriginalName = `${slugName}_${timestamp}.${ext}`;
        results.push({
          file: new File([compressedBlob], finalOriginalName, {
            type: file.type,
          }),
          type: 'original',
          url: URL.createObjectURL(compressedBlob),
        });
      } catch (e) {
        console.error('Compression failed', e);
        // Fallback to original if compression fails?
        const ext = file.name.split('.').pop();
        const finalOriginalName = `${slugName}_${timestamp}.${ext}`;
        results.push({
          file: new File([file], finalOriginalName, { type: file.type }),
          type: 'original',
          url: URL.createObjectURL(file),
        });
      }

      return {
        originalName: file.name,
        timestamp,
        files: results,
      };
    } catch (e: unknown) {
      const err = e as Error;
      error.value = err.message;
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    processImage,
    isProcessing,
    error,
  };
}
