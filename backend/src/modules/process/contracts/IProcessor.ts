import { BlobClient, BlockBlobClient } from '@azure/storage-blob'

export default interface IProcessor {
  resize(
    largestSideSize: number,
    sourceBlobClient: BlobClient,
    destinationBlobClient: BlockBlobClient,
  ): Promise<void>

  rotate(
    degrees: number,
    sourceBlobClient: BlobClient,
    destinationBlobClient: BlockBlobClient,
  ): Promise<void>
}
