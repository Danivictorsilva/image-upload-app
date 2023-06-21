import { Module } from '@nestjs/common'
import { ProcessController } from './process.controller'
import { ProcessService } from './process.service'
import { AzureModule } from '../azure/azure.module'
import SharpProcessor from './processors/SharpProcessor'

@Module({
  imports: [AzureModule],
  controllers: [ProcessController],
  providers: [ProcessService, SharpProcessor],
})
export class ProcessModule {}
