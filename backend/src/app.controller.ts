import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      name: 'erp-backend',
      version: '0.1.0',
      status: 'running',
    };
  }
}
