import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
import userTypes from '../../constants/user_types';

  @Injectable()
  export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();


      const token = request.headers['authorization'];

      if(!token){
        throw new UnauthorizedException();
      }

      const verified = this.jwtService.verify(token)

      if(verified?.type !== userTypes.admin){
        throw new UnauthorizedException();
      }

      request.auth = verified;
      return true;
    }
}
