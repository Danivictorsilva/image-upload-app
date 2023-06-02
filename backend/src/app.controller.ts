import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common'
import { AppService } from './app.service'
import { ApiProperty } from '@nestjs/swagger'

class ConfirmPayload {
  @ApiProperty()
  filename: string
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/upload/generate-sas-token')
  generateSasToken() {
    return this.appService.generateSasToken()
  }

  @Post('/api/upload/confirm')
  async confirmUpload(@Body() { filename }: ConfirmPayload) {
    const uploadConfirmed = await this.appService.confirmUpload(filename)

    if (uploadConfirmed) return this.appService.moveBlobFromContainer(filename)
    else return new NotFoundException('Blob not found.')
  }
}
