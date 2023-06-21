import {
  BlobGenerateSasUrlOptions,
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob'
import dayjs from 'dayjs'

import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AzureStorageService {
  private readonly accountUrl: string
  private readonly storageSharedKeyCredential: StorageSharedKeyCredential
  blobServiceClient: BlobServiceClient

  constructor(private readonly configService: ConfigService) {
    const accountName = this.configService.get<string>(
      'azure_storage.account_name',
    )
    const accountKey = this.configService.getOrThrow<string>(
      'azure_storage.account_key',
    )

    this.accountUrl = `https://${accountName}.blob.core.windows.net`
    this.storageSharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    )

    this.blobServiceClient = new BlobServiceClient(
      this.accountUrl,
      this.storageSharedKeyCredential,
    )
  }

  async generateSasUrl(
    containerName: string,
    blobName: string,
    options: BlobGenerateSasUrlOptions,
  ) {
    return this.blobServiceClient
      .getContainerClient(containerName)
      .getBlobClient(blobName)
      .generateSasUrl(options)
  }

  /**
   * @param {string} sourceContainerName
   * @param {string} sourceFileName
   * @param {string} destinationContainerName
   * @param {string} destinationFileName
   */
  async moveFile(
    sourceContainerName: string,
    sourceFileName: string,
    destinationContainerName: string,
    destinationFileName: string,
  ) {
    const sourceContainerClient =
      this.blobServiceClient.getContainerClient(sourceContainerName)
    const sourceBlobClient = sourceContainerClient.getBlobClient(sourceFileName)

    const sourceFileExist = await sourceBlobClient.exists()

    if (!sourceFileExist) {
      throw new Error(
        `${this.accountUrl}/${sourceContainerName}/${sourceFileName} not found!`,
      )
    }

    const sourceFileSasUrl = await sourceBlobClient.generateSasUrl({
      startsOn: dayjs().subtract(1, `minute`).toDate(),
      expiresOn: dayjs().add(1, `minute`).toDate(),
      permissions: BlobSASPermissions.from({ read: true }),
    })

    const destinationContainer = this.blobServiceClient.getContainerClient(
      destinationContainerName,
    )

    const destinationBlobClient =
      destinationContainer.getBlobClient(destinationFileName)

    return destinationBlobClient.syncCopyFromURL(sourceFileSasUrl)
  }

  exists(containerName: string, blobName: string) {
    return this.blobServiceClient
      .getContainerClient(containerName)
      .getBlobClient(blobName)
      .exists()
  }
}
