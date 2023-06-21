import { Module } from '@nestjs/common'
import { UploadModule } from './modules/upload/upload.module'
import { ProcessModule } from './modules/process/process.module'
import { ConfigModule } from '@nestjs/config'
import { AzureModule } from './infra/azure/azure.module'
import azureStorageConfig from './config/azure-storage.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [azureStorageConfig],
    }),
    UploadModule,
    AzureModule,
    ProcessModule,
  ],
})
export class AppModule {}
