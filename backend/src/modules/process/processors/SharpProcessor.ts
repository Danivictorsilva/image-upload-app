import IProcessor from '../contracts/IProcessor'
import * as sharp from 'sharp'
import { Injectable } from '@nestjs/common'

@Injectable()
export default class SharpProcessor implements IProcessor {
  async resize(readableStream: NodeJS.ReadableStream, largestSideSize: number) {
    const buffer = await this.streamToBuffer(readableStream)

    const largestSide = await this.getLargestSide(buffer)

    return sharp(buffer)
      .resize({
        [largestSide]: largestSideSize,
      })
      .jpeg({
        quality: 100,
      })
      .toBuffer()
  }

  async rotate(readableStream: NodeJS.ReadableStream, angle: number) {
    const buffer = await this.streamToBuffer(readableStream)

    return sharp(buffer).rotate(angle).toBuffer()
  }

  private async streamToBuffer(
    readableStream: NodeJS.ReadableStream,
  ): Promise<Buffer> {
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

  private async getLargestSide(filepath: Buffer) {
    const { height, width } = await sharp(filepath).metadata()
    return height > width ? `height` : `width`
  }
}
