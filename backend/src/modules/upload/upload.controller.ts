import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiProperty, ApiTags } from '@nestjs/swagger'
import { UploadService } from './upload.service'

class ConfirmPayload {
  @ApiProperty()
  filename: string
}

@ApiTags('Upload')
@Controller('/api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('/generate-sas-token')
  generateSasToken() {
    return this.uploadService.generateSasToken()
  }

  @Post('/confirm')
  async confirmUpload(@Body() { filename }: ConfirmPayload) {
    const uploadConfirmed = await this.uploadService.confirmUpload(filename)

    if (uploadConfirmed) {
      const response = await this.uploadService.copyBlobFromContainer(filename)

      if (response._response.status >= 200 && response._response.status < 300) {
        return this.uploadService.getBlobView(filename)
      } else {
        return new BadRequestException('Unable to finish tasks.')
      }
    } else {
      return new NotFoundException('Blob not found.')
    }
  }
}
