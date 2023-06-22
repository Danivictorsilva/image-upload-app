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

  async resize(filename: string) {
    const NEW_LARGEST_SIDE_SIZE_IN_PX = 3500
    const [name, extension] = filename.split('.')

    const sourceBlobClient = this.azureStorageService.blobServiceClient
      .getContainerClient(this.tmpContainer)
      .getBlobClient(filename)

    const destinationBlobClient = this.azureStorageService.blobServiceClient
      .getContainerClient(this.tmpContainer)
      .getBlockBlobClient(`${name}_resize_${Date.now()}.${extension}`)

    const blobDownloadResponseParsed = await sourceBlobClient.download()

    const processedBuffer = await this.sharpProcessor.resize(
      blobDownloadResponseParsed.readableStreamBody,
      NEW_LARGEST_SIDE_SIZE_IN_PX,
    )

    await destinationBlobClient.uploadData(processedBuffer)
  }

  async rotate(filename: string) {
    // const ROTATE_ANGLE_IN_DEGREE = 90
    // const blobClient = this.azureStorageService.blobServiceClient
    //   .getContainerClient(this.tmpContainer)
    //   .getBlobClient(filename)
    // this.sharpProcessor.rotate(ROTATE_ANGLE_IN_DEGREE)
  }
}
