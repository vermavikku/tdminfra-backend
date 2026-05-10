import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { UsersModule } from './users/users.module';
import { MachineriesModule } from './machineries/machineries.module';
import { S3Module } from './common/s3/s3.module';
import { ProfilesModule } from './profiles/profiles.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
    }),
    PrismaModule,
    EnquiriesModule,
    UsersModule,
    MachineriesModule,
    S3Module,
    ProfilesModule,
    CategoriesModule,
    // Dashboard provides summary metrics used by the admin UI
    DashboardModule,
    // Authentication endpoints (login, reset-password)
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    const { AuthMiddleware } = require('./common/middleware/auth.middleware');
    // Apply AuthMiddleware to all POST, PUT, DELETE routes except /auth/*
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.DELETE },
      );
  }
}
