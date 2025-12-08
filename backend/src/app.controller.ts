import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): object {
    return this.appService.getHealth();
  }

  @Get()
  serveRoot(@Res() res: Response): void {
    const frontendPath = path.join(__dirname, '..', '..', '..', 'frontend', '.next', 'standalone');
    const indexPath = path.join(frontendPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).json({
        message: 'FinFlow API Server',
        version: '1.0.0',
        endpoints: {
          api: '/api/v1',
          docs: '/api/docs',
          health: '/api/v1/health',
        },
      });
    }
  }
}








