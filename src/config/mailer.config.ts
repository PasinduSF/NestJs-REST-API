import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerAsyncOptions } from 'src/interfaces/mailer-async-options.interface';


const viewsPath = process.cwd() + '/src/templates/views/';
const partialsPath = process.cwd() + '/src/templates/partials/';

export const mailerAsyncOptions: MailerAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    transport: {
      service: config.get<string>('SMTP_SERVICE'),
      auth: {
        user: config.get<string>('GMAIL_USER'),
        pass: config.get<string>('GMAIL_PASS'),
      },
    },
    defaults: {
      from: config.get<string>('GMAIL_USER'),
    },
    template: {
      dir: viewsPath,
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
    options: {
      partials: {
        dir: partialsPath,
        options: {
          strict: true,
        },
      },
    },
  }),
  inject: [ConfigService],
};