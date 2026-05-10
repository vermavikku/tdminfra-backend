import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable JSON body parsing
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '10mb',
    }),
  );

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ✅ DEV ONLY – allow everything
  app.enableCors({
    origin: true, // reflect origin
    credentials: true, // allow cookies / auth headers
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  // CORS preflight debug handler — ensure preflight returns 204 with proper headers
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin || '*';
      console.log(
        `[CORS] preflight ${req.method} ${req.path} origin=${origin}`,
      );
      res.header('Access-Control-Allow-Origin', origin as string);
      res.header('Access-Control-Allow-Headers', '*');
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.sendStatus(204);
    }
    next();
  });

  // Serve static files from uploads directory
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Serving static files from:', uploadsPath);

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  app.use(
    '/uploads',
    express.static(uploadsPath, {
      maxAge: '1d', // Cache for 1 day
      etag: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('tdminfra API')
    .setDescription('tdminfra Backend API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
