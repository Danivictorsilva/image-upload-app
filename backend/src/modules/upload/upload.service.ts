import { Injectable } from '@nestjs/common'
import {
  BlobSASPermissions,
  BlobSASSignatureValues,
  BlobServiceClient,
  ContainerClient,
  ContainerSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'

@Injectable()
export class UploadService {
  async generateSasToken() {
    const tmpContainerName = process.env.TMP_CONTAINER_NAME
    const accountName = process.env.ACCOUNT_NAME
    const accountKey = process.env.ACCOUNT_KEY
    const blobName = this.generateBlobFilename()

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    )

    const sasUrl = await this.getContainerClient(
      sharedKeyCredential,
      tmpContainerName,
    ).generateSasUrl({
      expiresOn: dayjs().add(5, 'm').toDate(),
      startsOn: dayjs().toDate(),
      permissions: ContainerSASPermissions.from({ add: true, write: true }),
    })

    return {
      container: tmpContainerName,
      filename: blobName,
      sasUrl,
      sas: sasUrl.split('?').at(1),
      account: `https://${accountName}.blob.core.windows.net`,
    }
  }

  confirmUpload(filename: string): Promise<boolean> {
    const tmpContainerName = process.env.TMP_CONTAINER_NAME
    const accountName = process.env.ACCOUNT_NAME
    const accountKey = process.env.ACCOUNT_KEY
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    )

    return this.getContainerClient(sharedKeyCredential, tmpContainerName)
      .getBlobClient(filename)
      .exists()
  }

  copyBlobFromContainer(filename: string) {
    const privateContainerName = process.env.PRIVATE_CONTAINER_NAME
    const tmpContainerName = process.env.TMP_CONTAINER_NAME
    const accountName = process.env.ACCOUNT_NAME
    const accountKey = process.env.ACCOUNT_KEY

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    )

    const containerClientForTmpFile = this.getContainerClient(
      sharedKeyCredential,
      tmpContainerName,
    )

    const uriForTmpFileWithSas = this.getBlobSasUri(
      containerClientForTmpFile,
      filename,
      sharedKeyCredential,
      BlobSASPermissions.from({ read: true }),
    )

    return this.getContainerClient(sharedKeyCredential, privateContainerName)
      .getBlobClient(filename)
      .syncCopyFromURL(uriForTmpFileWithSas)
  }

  getBlobView(filename: string) {
    const privateContainerName = process.env.PRIVATE_CONTAINER_NAME
    const accountName = process.env.ACCOUNT_NAME
    const accountKey = process.env.ACCOUNT_KEY

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    )

    const containerClient = this.getContainerClient(
      sharedKeyCredential,
      privateContainerName,
    )

    return this.getBlobSasUri(
      containerClient,
      filename,
      sharedKeyCredential,
      BlobSASPermissions.from({ read: true }),
    )
  }

  private getBlobSasUri(
    containerClient: ContainerClient,
    blobName: string,
    sharedKeyCredential: StorageSharedKeyCredential,
    permissions: BlobSASPermissions,
    storedPolicyName?: string,
  ) {
    const sasOptions: BlobSASSignatureValues = {
      containerName: containerClient.containerName,
      blobName: blobName,
    }

    if (!storedPolicyName) {
      sasOptions.startsOn = dayjs().toDate()
      sasOptions.expiresOn = dayjs().add(5, 'minutes').toDate()
      sasOptions.permissions = permissions
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

  private generateBlobFilename = () => randomUUID()
}
