import { Body, Controller, Get, Post } from '@nestjs/common'
import { ProcessService } from './process.service'
import { ApiProperty, ApiTags } from '@nestjs/swagger'

class ProcessPayload {
  @ApiProperty()
  filename: string
}

@ApiTags('Process')
@Controller('/api/process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post('/resize')
  async resize(@Body() { filename }: ProcessPayload) {
    return this.processService.resize(filename)
  }

  @Post('/rotate')
  async rotate(@Body() { filename }: ProcessPayload) {
    return this.processService.rotate(filename)
  }
}
