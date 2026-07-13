import { IStorageGateway } from '../types';
import { FIREBASE_LOG_PREFIX } from '../constants';

/**
 * StorageGateway Skeleton / Stub
 *
 * Establishes the binary file upload/delete persistence contract, satisfying Slice 0.6
 * requirements. No live Firebase Storage upload processes are implemented in this slice.
 */
export class StorageGateway implements IStorageGateway {
  constructor() {
    console.info(`${FIREBASE_LOG_PREFIX} StorageGateway instantiated (Slice 0.6 Skeleton).`);
  }

  async uploadFile(
    file: File,
    userId: string,
    episodeId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    console.warn(
      `${FIREBASE_LOG_PREFIX} StorageGateway.uploadFile called for user "${userId}" and file "${file.name}" (STUB).`
    );

    // Simulate progress intervals for UI loader testing
    if (onProgress) {
      onProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress(45);
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress(85);
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress(100);
    }

    const mockStoredUrl = `https://firebasestorage.googleapis.com/v0/b/mock-bucket/o/users%2F${userId}%2Fuploads%2F${episodeId}%2F${encodeURIComponent(file.name)}?alt=media`;
    console.info(`${FIREBASE_LOG_PREFIX} Upload complete. Generated mock URL:`, mockStoredUrl);

    return mockStoredUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    console.info(`${FIREBASE_LOG_PREFIX} StorageGateway.deleteFile called for URL: "${fileUrl}" (STUB).`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
