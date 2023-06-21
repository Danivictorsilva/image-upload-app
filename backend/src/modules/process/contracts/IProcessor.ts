import { BlobClient } from '@azure/storage-blob'

export default interface IProcessor {
  resize(
    largestSideSize: number,
    sourceBlobClient: BlobClient,
    destinationBlobClient: BlobClient,
  ): Promise<void>

  rotate(
    degrees: number,
    sourceBlobClient: BlobClient,
    destinationBlobClient: BlobClient,
  ): Promise<void>
}
