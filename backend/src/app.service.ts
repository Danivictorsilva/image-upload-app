import { Injectable } from '@nestjs/common'
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
  async generateSasToken() {
    const containerName = process.env.CONTAINER_NAME
    const blobName = this.generateBlobFilename()
    const account = process.env.ACCOUNT_NAME
    const accountKey = process.env.ACCOUNT_KEY

    const sharedKeyCredential = new StorageSharedKeyCredential(
      account,
      accountKey,
    )

    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net`,
      sharedKeyCredential,
    )

    const containerClient = blobServiceClient.getContainerClient(containerName)

    const sasUri = this.getBlobSasUri(
      containerClient,
      blobName,
      sharedKeyCredential,
      'w',
    )

    return {
      container: containerName,
      filename: blobName,
      sasuri: sasUri,
    }
  }

  private generateBlobFilename() {
    return randomUUID()
  }

  getBlobSasUri(
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
}
