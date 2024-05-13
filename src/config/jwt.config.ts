import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
export const jwtModuleAsyncOptions: JwtModuleAsyncOptions = {
  global: true,
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
  }),
  inject: [ConfigService],
};