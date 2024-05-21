import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        const firebaseConfig = {
          projectId: configService.get('FIREBASE_PROJECT_ID'),
          privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
          clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
        };
        admin.initializeApp({
          credential: admin.credential.cert(firebaseConfig),
        });
        return admin;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}