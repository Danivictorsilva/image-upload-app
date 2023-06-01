import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { generateSasTokenReturn } from './contracts/types/GenerateSasTokenReturn'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/upload/generate-sas-token')
  getHello(): generateSasTokenReturn {
    return this.appService.generateSasToken()
    // return {
    //   container: 'container',
    //   filename: 'filename',
    //   sasToken: 'sasToken',
    //   account: 'account',
    // }
  }
}
