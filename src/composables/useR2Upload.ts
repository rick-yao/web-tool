import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ref } from 'vue';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain?: string;
}

export interface UploadResult {
  fileType: string;
  url: string;
}

export function useR2Upload() {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const error = ref<string | null>(null);

  const uploadFiles = async (
    files: File[],
    config: R2Config,
  ): Promise<UploadResult[]> => {
    isUploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    if (
      !config.accountId ||
      !config.accessKeyId ||
      !config.secretAccessKey ||
      !config.bucketName
    ) {
      error.value = 'Missing R2 configuration';
      isUploading.value = false;
      throw new Error(error.value);
    }

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const results: UploadResult[] = [];
    let completedCount = 0;

    try {
      const uploadPromises = files.map(async (file) => {
        try {
          const command = new PutObjectCommand({
            Bucket: config.bucketName,
            Key: file.name,
            Body: file,
            ContentType: file.type,
          });

          await client.send(command);

          completedCount++;
          uploadProgress.value = (completedCount / files.length) * 100;

          let publicUrl = '';
          if (config.publicDomain) {
            // Remove protocol if present to standardise
            const cleanDomain = config.publicDomain
              .replace(/^https?:\/\//, '')
              .replace(/\/$/, '');
            publicUrl = `https://${cleanDomain}/${file.name}`;
          } else {
            // Fallback/Default R2 link logic - though usually private
            publicUrl = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${file.name}`;
          }

          results.push({
            fileType: file.type,
            url: publicUrl,
          });
        } catch (error: unknown) {
          const err = error as Error;
          console.error(`Error uploading ${file.name}:`, err);
          if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            throw new Error(
              'CORS Error: Please ensure your R2 bucket allows PUT method from this origin.',
            );
          }
          throw err;
        }
      });

      await Promise.all(uploadPromises);
      return results;
    } catch (e: unknown) {
      const err = e as Error;
      error.value = err.message;
      throw err;
    } finally {
      isUploading.value = false;
    }
  };

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    error,
  };
}
