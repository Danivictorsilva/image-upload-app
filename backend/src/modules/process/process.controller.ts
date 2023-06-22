import { Body, Controller, Post } from '@nestjs/common'
import { ProcessService } from './process.service'
import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'

class ResizeRequestPayload {
  @ApiProperty()
  filename: string

  @ApiPropertyOptional({
    minimum: 500,
    default: 3500,
  })
  new_largest_side_size_in_px: number
}

class RotateRequestPayload {
  @ApiProperty()
  filename: string

  @ApiPropertyOptional({
    default: 90,
  })
  angle: number
}

@ApiTags('Process')
@Controller('/api/process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post('/resize')
  async resize(
    @Body() { filename, new_largest_side_size_in_px }: ResizeRequestPayload,
  ) {
    return this.processService.resize(filename, new_largest_side_size_in_px)
  }

  @Post('/rotate')
  async rotate(@Body() { filename, angle }: RotateRequestPayload) {
    return this.processService.rotate(filename, angle)
  }
}
