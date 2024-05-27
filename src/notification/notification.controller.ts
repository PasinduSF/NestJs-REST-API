import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';


@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Post('send')
  async receiveFcmToken(
    @Body('userId') userId: string,
    @Body('token') token: string,
  ) {
    console.log('Received FCM token:', token);
    
    await this.notificationService.saveUserToken(userId, token);
    // Send a notification to the user
    await this.notificationService.sendNotification(userId, {
      title: 'WEB3GENES',
      body: 'Your account has been deactivated..',
    });
    
  }
}