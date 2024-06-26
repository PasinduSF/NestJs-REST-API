import 'reflect-metadata'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mongooseModuleAsyncOptions } from './config/mongoose.config';
import UserModule from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleAsyncOptions } from './config/jwt.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerAsyncOptions } from './config/mailer.config';
import { FirebaseModule } from './firebase.module';
import { NotificationModule } from './notification/notification.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    JwtModule.registerAsync(jwtModuleAsyncOptions),
    MailerModule.forRootAsync(mailerAsyncOptions),
    UserModule,
    FirebaseModule,
    NotificationModule
    
  
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
