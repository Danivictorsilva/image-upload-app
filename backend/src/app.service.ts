import { Injectable } from '@nestjs/common'
import * as azure from 'azure-storage'
import { generateSasTokenReturn } from './contracts/types/GenerateSasTokenReturn'
import { randomUUID } from 'node:crypto'

@Injectable()
export class AppService {
  generateSasToken(): generateSasTokenReturn {
    const connString = process.env.AZURE_CONN_STRING
    const containerName = process.env.CONTAINER_NAME
    const accountName = process.env.ACCOUNT_NAME
    const blobName = this.generateBlobFilename()

    const blobService = azure.createBlobService(connString)

    const startDate = new Date()
    startDate.setMinutes(startDate.getMinutes() - 5)
    const expiryDate = new Date(startDate)
    expiryDate.setMinutes(startDate.getMinutes() + 60)

    const sharedAccessPolicy: azure.common.SharedAccessPolicy = {
      AccessPolicy: {
        Permissions: azure.BlobUtilities.SharedAccessPermissions.WRITE,
        Start: startDate,
        Expiry: expiryDate,
      },
    }

    const sasToken = blobService.generateSharedAccessSignature(
      containerName,
      blobName,
      sharedAccessPolicy,
    )

    return {
      container: containerName,
      filename: blobName,
      account: accountName,
      sasToken: sasToken,
    }
  }

  private generateBlobFilename(): string {
    return randomUUID()
  }
}
