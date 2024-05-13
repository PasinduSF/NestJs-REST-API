import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import userTypes from '../constants/user_types';
import SignUpDto from './dto/signUp.dto';
import UserLoginDto from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import UpdateUserDto from './dto/updateUser.dto';
import { MailerService } from '@nestjs-modules/mailer';

// Helper function to remove spaces and special characters from a string
function cleanMobileNumber(mobileNumber: string) {
  if (!mobileNumber.trim()) {
    return null;
  }
  return mobileNumber.replace(/[\s-()]/g, '');
}

@Injectable()
export default class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailerService,
  ) {}

  // Login service ---------------------------------------------------------------------------------
  async login(
    userLoginDto: UserLoginDto,
  ): Promise<{ access_token: string; user: any }> {
    const { email, password } = userLoginDto;
    const user = await this.userModel.findOne({ 'contact_info.email': email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.type !== 'ADMIN') {
      throw new UnauthorizedException('Unauthorized');
    }
    const isPasswordMatched = bcrypt.compareSync(
      password,
      user.auth_info.password,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { id: user._id, type: user.type };
    const access_token = await this.jwtService.signAsync(payload);
    console.log(access_token);
    return { access_token, user };
  }

  // Admin add service -------------------------------------------------------------------------------
  async adminAdd(signUpDto: SignUpDto): Promise<{ message: string }> {
    const { type, basic_info, contact_info, auth_info } = signUpDto;
    const { first_name, last_name, dob, gender } = basic_info;
    const { mobile_number, email } = contact_info;
    const { password } = auth_info;

    const rounds = this.configService.get('SALT_ROUNDS');
    const hashedPassword = bcrypt.hashSync(password, Number(rounds));
    const admin = await this.userModel.create({
      type,
      basic_info: { first_name, last_name, dob, gender },
      contact_info: { mobile_number, email },
      auth_info: { password: hashedPassword },
    });

    if (admin) {
      return { message: 'Admin added successfully' };
    } else {
      throw new Error('Failed to add admin user');
    }
  }

  // User Add service -------------------------------------------------------------------------------
  async userAdd(
    signUpDto: SignUpDto,
  ): Promise<{ message: string; user?: User }> {
    const { type, basic_info, contact_info } = signUpDto;
    const { first_name, last_name, dob, gender } = basic_info;
    const { mobile_number, email } = contact_info;

    // Check email is already exists
    const sEmail = email.trim().toLowerCase();
    const isEmailExists = await this.userModel.findOne({
      'contact_info.email': sEmail,
    });
    if (isEmailExists) {
      throw new ConflictException('Email already exists');
    }

    // Check if any of the phone numbers already exist for any other user
    const cleanedMobileNumbers = mobile_number
      .map(cleanMobileNumber)
      .filter((number) => number !== null);

    const isOtherUserPhoneNumberExists = await this.userModel.findOne({
      _id: { $ne: isEmailExists?._id },
      'contact_info.mobile_number': { $in: cleanedMobileNumbers },
    });
    if (isOtherUserPhoneNumberExists) {
      throw new ConflictException(
        'One or more phone numbers already exist for another user',
      );
    }

    // Check number of phon numbers phone number
    const numberOfMobileNumbers = mobile_number.length;
    if (numberOfMobileNumbers > 3) {
      throw new ConflictException('Only allow three mobile numbers');
    }

    const user = await this.userModel.create({
      type,
      basic_info: { first_name, last_name, dob, gender },
      contact_info: { mobile_number, email },
      auth_info: { password: '' },
    });

    if (user) {
      return { message: 'User added successfully' };
    } else {
      throw new Error('Failed to add user');
    }
  }

  // Get user service -------------------------------------------------------------------------------
  async getUsers(): Promise<User[]> {
    const users = await this.userModel
      .find({ type: { $ne: userTypes.admin } })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
      .exec();

    return users;
  }

  // Update user service -------------------------------------------------------------------------------
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string }> {
    // Check if the new email already exists for another user
    const emailExists = await this.userModel.findOne({
      'contact_info.email': updateUserDto.contact_info.email,
      _id: { $ne: userId },
    });

    if (emailExists) {
      throw new ConflictException('Email already exists');
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return { message: 'User update successfully' };
  }

  // Deactivate User service -------------------------------------------------------------------------------
  async deactivateUser(userId: string) {
    // Retrieve user information from the database based on userId
    const user = await this.userModel.findById(userId);

    // Check if user is found
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user is already inactive
    if (user.status === 'INACTIVE') {
      throw new ConflictException(`User with ID ${userId} is already inactive`);
    }

    // Deactivate user
    user.status = 'INACTIVE';
    await user.save();

    try {
      // Send email
      await this.mailService.sendMail({
        to: user.contact_info.email,
        subject: 'Profile Deactivated',
        template: 'deactivation',
        context: {
          firstName: user.basic_info.first_name,
        },
      });
    } catch (error) {
      throw new ConflictException(
        `Failed to send email for user ID ${userId}: ${error.message}`,
      );
    }

    return { message: 'User deactivate email sent successfully' };
  }
}
