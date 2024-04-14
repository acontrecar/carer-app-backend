import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { ErrorHandleService } from './error-handle/error-handle.service';

@Module({
  controllers: [CommonController],
  providers: [CommonService, ErrorHandleService],
})
export class CommonModule {}
