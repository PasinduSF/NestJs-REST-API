import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import SignUpDto from './dto/signUp.dto';
import userTypes from '../constants/user_types';
import UserLoginDto from './dto/login.dto';
import UpdateUserDto from './dto/updateUser.dto';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import UserService from './user.service';
import * as bcrypt from 'bcrypt';
import genders from '../constants/gender';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;

  // Mock implementations for dependencies
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock_token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(10),
  };

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailerService, useValue: mockMailerService },
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Login Unit testing -------------------------------------------------------
  describe('login', () => {
    
    it('should return access_token and user for valid credentials', async () => {

      const userLoginDto: UserLoginDto = {
        email: 'sat@gmail.com',
        password: '123456',
      };

      const hashedPassword = bcrypt.hashSync('123456', 10);
      const mockUser: User = {
        type: userTypes.admin,
        status: 'ACTIVE',
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890'],
          email: 'sat@gmail.com',
        },
        auth_info: {
          password: hashedPassword,
        },
      } as User;

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await service.login(userLoginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user', mockUser);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const userLoginDto: UserLoginDto = {
        email: 'invalid@example.com',
        password: 'password',
      };
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

      await expect(service.login(userLoginDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-admin user', async () => {
      const userLoginDto: UserLoginDto = {
        email: 'user@example.com',
        password: 'password',
      };
      const mockUser = {
        type: 'USER',
      } as User;
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser);

      await expect(service.login(userLoginDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const userLoginDto: UserLoginDto = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };
      const mockUser = {
        type: 'ADMIN',
        auth_info: {
          password:
            '$2b$10$jdBC8dWYcuAMyef8xseruOhFNHJJPkYbwgyPXxQQSiS.WHi6ioLzK',
        },
      } as User;
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser);

      await expect(service.login(userLoginDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });

  // adinAdd Unit testing -------------------------------------------------------
  describe('adminAdd', () => {
    it('should add a new admin user', async () => {
      const signUpDto: SignUpDto = {
        type: userTypes.admin,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890'],
          email: 'admin@example.com',
        },
        auth_info: {
          password: 'password',
        },
      };
      jest.spyOn(userModel, 'create').mockResolvedValueOnce({} as any);

      const result = await service.adminAdd(signUpDto);

      expect(result).toEqual({ message: 'Admin added successfully' });
    });

    it('should throw an error if admin creation fails', async () => {
      const signUpDto: SignUpDto = {
        type: userTypes.admin,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890'],
          email: 'admin@example.com',
        },
        auth_info: {
          password: 'password',
        },
      };
      jest
        .spyOn(userModel, 'create')
        .mockRejectedValueOnce(new Error('Failed to add admin user'));

      await expect(service.adminAdd(signUpDto)).rejects.toThrowError(
        'Failed to add admin user',
      );
    });
  });

  // userAdd Unit testing -------------------------------------------------------
  describe('userAdd', () => {
    it('should add a new user', async () => {
      const signUpDto: SignUpDto = {
        type: userTypes.user,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890'],
          email: 'user@example.com',
        },
        auth_info: {
          password: 'password',
        },
      };

      const mockCreatedUser = {
        toObject: () => ({
          type: userTypes.user,
          status: 'ACTIVE',
          basic_info: {
            first_name: 'John',
            last_name: 'Doe',
            gender: genders.male,
            dob: '1990-01-01',
          },
          contact_info: {
            mobile_number: ['1234567890'],
            email: 'user@example.com',
          },
          auth_info: {
            password: '',
          },
        }),
      };

      jest
        .spyOn(userModel, 'create')
        .mockResolvedValueOnce(mockCreatedUser as any);

      const result = await service.userAdd(signUpDto);

      expect(result).toEqual({ message: 'User added successfully' });
      expect(userModel.create).toHaveBeenCalledWith({
        type: userTypes.user,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890'],
          email: 'user@example.com',
        },
        auth_info: {
          password: '',
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const signUpDto: SignUpDto = {
        type: userTypes.user,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890'],
          email: 'user@example.com',
        },
        auth_info: {
          password: 'password',
        },
      };
      const existingUser = {
        contact_info: { email: 'user@example.com' },
      } as User;
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(existingUser);

      await expect(service.userAdd(signUpDto)).rejects.toThrowError(
        ConflictException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        'contact_info.email': 'user@example.com',
      });
    });

    it('should throw ConflictException if any mobile number already exists for another user', async () => {
      const signUpDto: SignUpDto = {
        type: userTypes.user,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890'],
          email: 'user@example.com',
        },
        auth_info: {
          password: 'password',
        },
      };
      const existingUser = {
        contact_info: { mobile_number: ['1234567890'] },
      } as User;
      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUser);

      await expect(service.userAdd(signUpDto)).rejects.toThrowError(
        ConflictException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({
        _id: { $ne: undefined },
        'contact_info.mobile_number': { $in: ['1234567890'] },
      });
    });

    it('should throw ConflictException if more than three mobile numbers are provided', async () => {
      const signUpDto: SignUpDto = {
        type: userTypes.user,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: [
            '1234567890',
            '0987654321',
            '5551234567',
            '9876543210',
          ],
          email: 'user@example.com',
        },
        auth_info: {
          password: 'password',
        },
      };
      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.userAdd(signUpDto)).rejects.toThrowError(
        ConflictException,
      );
    });
  });

  // User get Unit testing -------------------------------------------------------
  describe('getUsers', () => {
    it('should return only USER records sorted by createdAt in descending order', async () => {
      const mockUsers = [
        {
          type: 'USER',
          status: 'ACTIVE',
          basic_info: {
            first_name: 'John',
            last_name: 'Doe',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: '1234567890',
            email: 'user@example.com',
          },
          auth_info: {
            password: 'hashedPassword',
          },
          createdAt: new Date('2023-05-10T12:00:00Z'),
        },
        {
          type: 'USER',
          status: 'ONBOARD',
          basic_info: {
            first_name: 'Ayeshani',
            last_name: 'Dabare',
            dob: '1995-04-16',
            gender: 'FEMALE',
          },
          contact_info: {
            mobile_number: '7873282787',
            email: 'myemail2@gmail.com',
          },
          auth_info: {
            password: '',
          },
          createdAt: new Date('2023-05-01T10:00:00Z'),
        },
      ];
      const findSpy = jest.spyOn(userModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockUsers),
      } as any);

      const result = await service.getUsers();

      expect(findSpy).toHaveBeenCalledWith({ type: { $ne: userTypes.admin } });
      expect(result).toEqual([
        {
          type: 'USER',
          status: 'ACTIVE',
          basic_info: {
            first_name: 'John',
            last_name: 'Doe',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: '1234567890',
            email: 'user@example.com',
          },
          auth_info: {
            password: 'hashedPassword',
          },
          createdAt: new Date('2023-05-10T12:00:00Z'),
        },
        {
          type: 'USER',
          status: 'ONBOARD',
          basic_info: {
            first_name: 'Ayeshani',
            last_name: 'Dabare',
            dob: '1995-04-16',
            gender: 'FEMALE',
          },
          contact_info: {
            mobile_number: '7873282787',
            email: 'myemail2@gmail.com',
          },
          auth_info: {
            password: '',
          },
          createdAt: new Date('2023-05-01T10:00:00Z'),
        },
      ]);
    });
  });

  // User update Unit testing -------------------------------------------------------
  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = '6639e925a7fe8c2b6d5d0ff2';
      const updateUserDto: UpdateUserDto = {
        type: userTypes.user,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890', '0772234567', ''],
          email: 'user@example.com',
        },
        auth_info: {
          password: '',
        },
      };

      const mockUpdatedUser = {
        toObject: () => ({
          _id: userId,
          ...updateUserDto,
        }),
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(mockUpdatedUser as any);

      const result = await service.updateUser(userId, updateUserDto);

      expect(result).toEqual({ message: 'User update successfully' });
      expect(userModel.findOne).toHaveBeenCalledWith({
        'contact_info.email': 'user@example.com',
        _id: { $ne: userId },
      });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        { new: true },
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const userId = '6639e925a7fe8c2b6d5d0ff2';
      const updateUserDto: UpdateUserDto = {
        type: userTypes.user,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890', '0772234567', ''],
          email: 'user@example.com',
        },
        auth_info: {
          password: '',
        },
      };

      const existingUser = {
        contact_info: { email: 'user@example.com' },
      } as User;

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(existingUser);

      await expect(
        service.updateUser(userId, updateUserDto),
      ).rejects.toThrowError(ConflictException);
      expect(userModel.findOne).toHaveBeenCalledWith({
        'contact_info.email': 'user@example.com',
        _id: { $ne: userId },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '6639e925a7fe8c2b6d5d0ff2';
      const updateUserDto: UpdateUserDto = {
        type: userTypes.user,
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890', '0772234567', ''],
          email: 'user@example.com',
        },
        auth_info: {
          password: '',
        },
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      await expect(
        service.updateUser(userId, updateUserDto),
      ).rejects.toThrowError(NotFoundException);
      expect(userModel.findOne).toHaveBeenCalledWith({
        'contact_info.email': 'user@example.com',
        _id: { $ne: userId },
      });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        { new: true },
      );
    });
  });

  // User deactivate Unit testing -------------------------------------------------------
  describe('deactivateUser', () => {
    it('should deactivate the user and send an email', async () => {
      // Arrange
      const userId = '6639e925a7fe8c2b6d5d0ff2';
      const mockUser = {
        _id: userId,
        type: 'USER',
        status: 'ACTIVE',
        basic_info: {
          first_name: 'John',
          last_name: 'Doe',
          gender: genders.male,
          dob: '1990-01-01',
        },
        contact_info: {
          mobile_number: ['1234567890'],
          email: 'user@example.com',
        },
        auth_info: {
          password: '',
        },
        save: jest.fn(),
      };

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      const saveSpy = jest.spyOn(mockUser, 'save');
      const sendMailSpy = jest.spyOn(mockMailerService, 'sendMail');

      const result = await service.deactivateUser(userId);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(saveSpy).toHaveBeenCalled();
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Profile Deactivated',
        template: 'deactivation',
        context: {
          firstName: 'John',
        },
      });
      expect(result).toEqual({
        message: 'User deactivate email sent successfully',
      });
      expect(mockUser.status).toBe('INACTIVE');
    });

    it('should throw an error if the user is not found', async () => {
      const userId = '6639e925a7fe8c2b6d5d0ff2';
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(null);

      await expect(service.deactivateUser(userId)).rejects.toThrowError(
        `User with ID ${userId} not found`,
      );
    });

    it('should throw a ConflictException if the user is already inactive', async () => {
      const userId = '6639e925a7fe8c2b6d5d0ff2';
      const mockUser = {
        _id: userId,
        type: 'USER',
        status: 'INACTIVE',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);

      await expect(service.deactivateUser(userId)).rejects.toThrowError(
        ConflictException,
      );
      await expect(service.deactivateUser(userId)).rejects.toThrowError(
        `User with ID ${userId} not found`,
      );
    });

    it('should throw ConflictException if sending the email fails', async () => {
      const userId = 'email-fail-user-id';
      const mockUser = {
        _id: userId,
        status: 'ACTIVE',
        contact_info: { email: 'user@example.com' },
        basic_info: { first_name: 'John' },
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(mockMailerService, 'sendMail')
        .mockRejectedValue(new Error('Email server down'));

      await expect(service.deactivateUser(userId)).rejects.toThrowError(
        new ConflictException(
          `Failed to send email for user ID ${userId}: Email server down`,
        ),
      );
    });
  });
});
