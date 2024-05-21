import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseModule } from '../firebase.module';
import UserModule from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.schema';


@Module({
    imports: [
        FirebaseModule,
        forwardRef(() => UserModule),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService], 
})
export class NotificationModule {}