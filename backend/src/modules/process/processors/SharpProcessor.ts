import { BlobClient, BlockBlobClient } from '@azure/storage-blob'
import IProcessor from '../contracts/IProcessor'
import * as sharp from 'sharp'
import { Injectable } from '@nestjs/common'
import { resolve } from 'path'
import * as fs from 'node:fs/promises'

@Injectable()
export default class SharpProcessor implements IProcessor {
  async resize(
    largestSideSize: number,
    sourceBlobClient: BlobClient,
    destinationBlobClient: BlockBlobClient,
  ): Promise<void> {
    const blobDownloadResponseParsed = await sourceBlobClient.download()
    const originalBuffer = await this.streamToBuffer(
      blobDownloadResponseParsed.readableStreamBody,
    )

    const biggerSide = await this.getLargestSide(originalBuffer)

    const processedBuffer = await sharp(originalBuffer)
      .resize({
        [biggerSide]: largestSideSize,
      })
      .jpeg({
        force: true,
        quality: 100,
      })
      .toBuffer()

    destinationBlobClient.uploadData(processedBuffer)
  }

  rotate(
    degrees: number,
    sourceBlobClient: BlobClient,
    destinationBlobClient: BlobClient,
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }

  private async streamToBuffer(readableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks = []
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data))
      })
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      readableStream.on('error', reject)
    })
  }

  private async getLargestSide(filepath) {
    const { height, width } = await sharp(filepath).metadata()
    return height > width ? `height` : `width`
  }
}
