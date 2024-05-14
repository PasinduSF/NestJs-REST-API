import { ModuleMetadata } from '@nestjs/common/interfaces';
import { MailerOptions } from '@nestjs-modules/mailer';

export interface MailerAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  imports: any[];
  useFactory: (...args: any[]) => Promise<MailerOptions> | MailerOptions;
  inject: any[];
} 
  