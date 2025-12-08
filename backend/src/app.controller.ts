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
    // Try to serve Next.js app
    const nextPath = path.join(__dirname, 'public', '.next', 'standalone');
    const indexPath = path.join(nextPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Fallback to API info
      res.status(200).json({
        message: 'FinFlow - Bank Statement Processing System',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          api: '/api/v1',
          health: '/api/v1/health',
          docs: '/api/docs',
        },
      });
    }
  }
}








