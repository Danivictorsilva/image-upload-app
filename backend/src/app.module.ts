import { Module } from '@nestjs/common'
import { UploadModule } from './modules/upload-outdated/upload.module'
import { ProcessModule } from './modules/process/process.module'
import { ConfigModule } from '@nestjs/config'
import azureStorageConfig from './config/azure-storage.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [azureStorageConfig],
    }),
    UploadModule,
    ProcessModule,
  ],
})
export class AppModule {}
