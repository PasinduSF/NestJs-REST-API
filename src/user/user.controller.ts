import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import UserService from './user.service';
import SignUpDto from './dto/signUp.dto';
import UserLoginDto from './dto/login.dto';
import { AdminGuard } from './guards/admin.guard';
import UserModule from './user.module';
import UpdateUserDto from './dto/updateUser.dto';
import { Response } from 'express';
import { User } from './user.schema';




@Controller("users")
export default class UserController {
  constructor(private service: UserService) {}


// Admin add ----------------------------------------------------
  @Post("adminAdd")
  adminAdd(@Body() signUpDto: SignUpDto): Promise<{message:string}> {
    return this.service.adminAdd(signUpDto)
  }


  @Post("login")
  async login(
    @Body() userLoginDto: UserLoginDto,
    @Res() res: Response
  ): Promise<Response<{ access_token: string; user: any }, Record<string, any>>> {
    const { access_token, user } = await this.service.login(userLoginDto);
    res.setHeader('Authorization', access_token);
    return res.status(200).json({ access_token, user });
  }


  @UseGuards(AdminGuard)
  @Post("userAdd")
  async addUser(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response
  ): Promise<Response<{ message: string, user?: User }>> {
    const result = await this.service.userAdd(signUpDto);
    return res.status(200).json(result);
  }

  @UseGuards(AdminGuard) 
  @Get("getUsers")
  async getUsers(): Promise<UserModule[]> {
    return this.service.getUsers();
  }

  @UseGuards(AdminGuard)
  @Put('updateUser/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserModule> {
    return this.service.updateUser(userId, updateUserDto);
  }


  @UseGuards(AdminGuard)
  @Post('deactivate/:userId')
  async deactivateUser(
    @Param('userId') userId: string,
    @Res() res: Response) {
      const result = await this.service.deactivateUser(userId);  
      return res.status(200).json({ result });
  }

}
