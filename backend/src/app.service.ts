import { BadRequestException, Injectable } from '@nestjs/common'
import {
  BlobSASPermissions,
  BlobSASSignatureValues,
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob'
import { randomUUID } from 'node:crypto'
import * as dayjs from 'dayjs'

@Injectable()
export class AppService {
  generateSasToken() {
    const containerName = process.env.CONTAINER_NAME
    const accountName = process.env.ACCOUNT_NAME
    const accountKey = process.env.ACCOUNT_KEY
    const blobName = this.generateBlobFilename()

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    )

    const containerClient = this.getContainerClient(
      sharedKeyCredential,
      containerName,
    )

    const sasUri = this.getBlobSasUri(
      containerClient,
      blobName,
      sharedKeyCredential,
      'w',
    )

    return {
      container: containerName,
      filename: blobName,
      sasUri,
    }
  }

  confirmUpload(filename: string): Promise<boolean> {
    const containerName = process.env.CONTAINER_NAME
    const accountName = process.env.ACCOUNT_NAME
    const accountKey = process.env.ACCOUNT_KEY
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    )

    return this.getContainerClient(sharedKeyCredential, containerName)
      .getBlobClient(filename)
      .exists()
  }

  moveBlobFromContainer(filename: string) {
    const successOnMove = false // TODO

    if (successOnMove)
      return new BadRequestException('Could not move blob from temp container.')
  }

  private generateBlobFilename = () => randomUUID()

  private getBlobSasUri(
    containerClient: ContainerClient,
    blobName: string,
    sharedKeyCredential: StorageSharedKeyCredential,
    permissions: string,
    storedPolicyName?: string,
  ) {
    const sasOptions: BlobSASSignatureValues = {
      containerName: containerClient.containerName,
      blobName: blobName,
    }

    if (!storedPolicyName) {
      sasOptions.startsOn = dayjs().toDate()
      sasOptions.expiresOn = dayjs().add(5, 'minutes').toDate()
      sasOptions.permissions = BlobSASPermissions.parse(permissions)
    } else {
      sasOptions.identifier = storedPolicyName
    }

    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential,
    ).toString()

    return `${containerClient.getBlockBlobClient(blobName).url}?${sasToken}`
  }

  private getContainerClient(
    storageSharedKeyCredential: StorageSharedKeyCredential,
    containerName,
  ) {
    return new BlobServiceClient(
      `https://${storageSharedKeyCredential.accountName}.blob.core.windows.net`,
      storageSharedKeyCredential,
    ).getContainerClient(containerName)
  }
}
