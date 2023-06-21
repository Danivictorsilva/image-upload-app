import { BlobClient } from '@azure/storage-blob'
import IProcessor from '../contracts/IProcessor'
import * as sharp from 'sharp'
import { Injectable } from '@nestjs/common'

@Injectable()
export default class SharpProcessor implements IProcessor {
  async resize(
    largestSideSize: number,
    sourceBlobClient: BlobClient,
    destinationBlobClient: BlobClient,
  ): Promise<void> {
    const downloadBlockBlobResponse = await sourceBlobClient.download()
    const downloaded = await this.streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody,
    )

    const biggerSide = await this.getBiggerSide(downloaded)

    const buffer = await sharp(downloaded)
      .resize({
        [biggerSide]: largestSideSize,
      })
      .jpeg({
        force: true,
        quality: 100,
      })
      .toBuffer()
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

  private async getBiggerSide(filepath) {
    const { height, width } = await sharp(filepath).metadata()
    return height > width ? `height` : `width`
  }
}
