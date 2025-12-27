import { decode as decodeAvif, encode as encodeAvif } from '@jsquash/avif';
import { decode as decodePng } from '@jsquash/png';
import { encode as encodeWebp } from '@jsquash/webp';
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

  /**
   * Decode image file to ImageData using appropriate decoder
   */
  const decodeImage = async (file: File): Promise<ImageData> => {
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type;

    // Use appropriate decoder based on file type
    if (mimeType === 'image/png') {
      const result = await decodePng(arrayBuffer);
      if (!result) throw new Error('Failed to decode PNG');
      return result;
    }
    if (mimeType === 'image/avif') {
      const result = await decodeAvif(arrayBuffer);
      if (!result) throw new Error('Failed to decode AVIF');
      return result;
    }

    // For other formats (JPEG, etc.), use Canvas API to decode
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
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(img.src);
        resolve(imageData);
      };
      img.onerror = () => reject(new Error('Failed to decode image'));
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

      // Decode the original image once
      const imageData = await decodeImage(file);

      // 1. WebP conversion with quality 0.8
      try {
        const webpBuffer = await encodeWebp(imageData, { quality: 80 });
        const finalWebPName = `${slugName}_${timestamp}.webp`;
        const webpBlob = new Blob([webpBuffer], { type: 'image/webp' });
        results.push({
          file: new File([webpBlob], finalWebPName, { type: 'image/webp' }),
          type: 'webp',
          url: URL.createObjectURL(webpBlob),
        });
      } catch (e) {
        console.error('WebP conversion failed', e);
      }

      // 2. AVIF conversion with quality 0.6 for better compression
      try {
        const avifBuffer = await encodeAvif(imageData, {
          quality: 60,
          // Optional: speed vs quality tradeoff (0-10, higher = faster but lower quality)
          speed: 6,
        });
        const finalAvifName = `${slugName}_${timestamp}.avif`;
        const avifBlob = new Blob([avifBuffer], { type: 'image/avif' });

        // Only include AVIF if it's smaller than the original
        if (avifBlob.size < file.size) {
          results.push({
            file: new File([avifBlob], finalAvifName, { type: 'image/avif' }),
            type: 'avif',
            url: URL.createObjectURL(avifBlob),
          });
        } else {
          console.warn(
            `AVIF (${avifBlob.size} bytes) is larger than original (${file.size} bytes), skipping`,
          );
        }
      } catch (e) {
        console.error('AVIF conversion failed', e);
      }

      // 3. Keep original file as-is (no compression to avoid increasing file size)
      try {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const finalOriginalName = `${slugName}_${timestamp}.${ext}`;

        results.push({
          file: new File([file], finalOriginalName, { type: file.type }),
          type: 'original',
          url: URL.createObjectURL(file),
        });
      } catch (e) {
        console.error('Failed to process original file', e);
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
