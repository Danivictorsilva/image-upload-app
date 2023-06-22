import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AzureStorageService } from '../../infra/azure/azure-storage.service'
import SharpProcessor from './processors/SharpProcessor'

@Injectable()
export class ProcessService {
  private readonly tmpContainer: string
  private readonly privateContainer: string

  constructor(
    private configService: ConfigService,
    private azureStorageService: AzureStorageService,
    private sharpProcessor: SharpProcessor,
  ) {
    this.tmpContainer = this.configService.getOrThrow<string>(
      'azure_storage.containers.tmp',
    )
    this.privateContainer = this.configService.getOrThrow<string>(
      'azure_storage.containers.private',
    )
  }

  async resize(filename: string, newLargestSideSizeInPx = 3500) {
    const [name, extension] = filename.split('.')
    const newFilename = extension
      ? `${name}_resize.${extension}`
      : `${name}_resize`

    const sourceBlobClient = this.azureStorageService.blobServiceClient
      .getContainerClient(this.tmpContainer)
      .getBlobClient(filename)

    const destinationBlobClient = this.azureStorageService.blobServiceClient
      .getContainerClient(this.privateContainer)
      .getBlockBlobClient(newFilename)

    const blobDownloadResponseParsed = await sourceBlobClient.download()

    const start = Date.now()

    const processedBuffer = await this.sharpProcessor.resize(
      blobDownloadResponseParsed.readableStreamBody,
      newLargestSideSizeInPx,
    )

    const processTime = Date.now() - start

    await destinationBlobClient.uploadData(processedBuffer)

    const uploadTime = Date.now() - start

    return {
      processTime,
      uploadTime,
    }
  }

  async rotate(filename: string, angle = 90) {
    const [name, extension] = filename.split('.')
    const newFilename = extension
      ? `${name}_rotate.${extension}`
      : `${name}_rotate`

    const sourceBlobClient = this.azureStorageService.blobServiceClient
      .getContainerClient(this.tmpContainer)
      .getBlobClient(filename)

    const destinationBlobClient = this.azureStorageService.blobServiceClient
      .getContainerClient(this.privateContainer)
      .getBlockBlobClient(newFilename)

    const blobDownloadResponseParsed = await sourceBlobClient.download()

    const start = Date.now()

    const processedBuffer = await this.sharpProcessor.rotate(
      blobDownloadResponseParsed.readableStreamBody,
      angle,
    )

    const processTime = Date.now() - start

    await destinationBlobClient.uploadData(processedBuffer)

    const uploadTime = Date.now() - start

    return {
      processTime,
      uploadTime,
    }
  }
}
