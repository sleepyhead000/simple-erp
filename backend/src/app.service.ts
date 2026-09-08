import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'erp-backend',
      version: '0.1.0',
      status: 'running',
    };
  }
}
