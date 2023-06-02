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

    return this.getBlobSasUri(containerClient, blobName, sharedKeyCredential)

    // return {
    //   container: containerName,
    //   filename: blobName,
    //   account: accountName,
    //   sasToken: sasToken,
    // }
  }

  private generateBlobFilename() {
    return randomUUID()
  }

  getBlobSasUri(
    containerClient: ContainerClient,
    blobName: string,
    sharedKeyCredential: StorageSharedKeyCredential,
    storedPolicyName?: string,
  ) {
    const sasOptions: BlobSASSignatureValues = {
      containerName: containerClient.containerName,
      blobName: blobName,
    }

    if (storedPolicyName == null) {
      sasOptions.startsOn = new Date()
      sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000)
      sasOptions.permissions = BlobSASPermissions.parse('w')
    } else {
      sasOptions.identifier = storedPolicyName
    }

    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential,
    ).toString()
    console.log(`SAS token for blob is: ${sasToken}`)

    return `${containerClient.getBlockBlobClient(blobName).url}?${sasToken}`
  }
}
