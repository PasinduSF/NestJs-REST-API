import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UserController  from './user.controller';
import UserService from './user.service';
import { User, UserSchema } from './user.schema';
import { PassportModule } from '@nestjs/passport';

import { NotificationService } from 'src/notification/notification.service';
import { FirebaseModule } from 'src/firebase.module';
import { NotificationModule } from 'src/notification/notification.module';




@Module({
  imports: [
    PassportModule.register({defaultStrategy:"jwt"}),
    MongooseModule.forFeature([{name:User.name, schema:UserSchema}]),
    FirebaseModule,
    NotificationModule,
  ],
  controllers: [UserController],
  providers: [UserService,NotificationService],
})
export default class UserModule {}
