import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import UserController  from './user.controller';
import UserService from './user.service';
import { User, UserSchema } from './user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';



@Module({
  imports: [
    PassportModule.register({defaultStrategy:"jwt"}),
    MongooseModule.forFeature([{name:User.name, schema:UserSchema}]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export default class UserModule {}
