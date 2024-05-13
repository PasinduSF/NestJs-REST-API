import userTypes from "../../constants/user_types";
import SignUpDto from "./signUp.dto"
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import UpdateUserDto from "./updateUser.dto";

describe ('Adding a User', () =>{

    it('should pass validation for valid data', async () => {
        const validData = {
          type: userTypes.user,
          basic_info: {
            first_name: 'John',
            last_name: 'Doe',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: ['1234567890', '0987654321',''],
            email: 'john@example.com',
          },
          auth_info: {
            password: 'password123',
          },
        };
    
        const signUpDto = plainToInstance(SignUpDto, validData);
        const errors = await validate(signUpDto);
        expect(errors.length).toBe(0);
      });

      it('should not allow empty first name', async () => {
        const validData = {
          type: userTypes.user,
          basic_info: {
            first_name: '',
            last_name: 'Doe',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: ['1234567890', '0987654321',''],
            email: 'john@example.com',
          },
          auth_info: {
            password: 'password123',
          },
        };
    
        const signUpDto = plainToInstance(SignUpDto, validData);
        const errors = await validate(signUpDto);
        expect(errors.length).toBe(1);
      });

      it('should not allow empty last name', async () => {
        const validData = {
          type: userTypes.user,
          basic_info: {
            first_name: 'Jhon',
            last_name: '',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: ['1234567890', '0987654321',''],
            email: 'john@example.com',
          },
          auth_info: {
            password: 'password123',
          },
        };
    
        const signUpDto = plainToInstance(SignUpDto, validData);
        const errors = await validate(signUpDto);
        expect(errors.length).toBe(1);
      });

      it('should not allow wrong email address', async () => {
        const validData = {
          type: userTypes.user,
          basic_info: {
            first_name: 'Jhon',
            last_name: 'Doe',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: ['1234567890', '0987654321',''],
            email: 'johnexample.com',
          },
          auth_info: {
            password: 'password123',
          },
        };
    
        const signUpDto = plainToInstance(SignUpDto, validData);
        const errors = await validate(signUpDto);
        expect(errors.length).toBe(1);
      });

      it('should not allow more than 25 characters for first name', async () => {
        const validData = {
          type: userTypes.user,
          basic_info: {
            first_name: 'Jhon Steave Watsone Jhon Steave Watsone ',
            last_name: 'Doe',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: ['1234567890', '0987654321',''],
            email: 'johne@xample.com',
          },
          auth_info: {
            password: 'password123',
          },
        };
    
        const signUpDto = plainToInstance(SignUpDto, validData);
        const errors = await validate(signUpDto);
        expect(errors.length).toBe(1);
      });

      it('should not allow more than 25 characters for last name', async () => {
        const validData = {
          type: userTypes.user,
          basic_info: {
            first_name: 'Jhon',
            last_name: 'Jhon Steave Watsone Jhon Steave Watsone ',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: ['1234567890', '0987654321',''],
            email: 'johne@xample.com',
          },
          auth_info: {
            password: 'password123',
          },
        };
    
        const signUpDto = plainToInstance(SignUpDto, validData);
        const errors = await validate(signUpDto);
        expect(errors.length).toBe(1);
      });

      it('should not allow more than 15 characters for mobile number', async () => {
        const validData = {
          type: userTypes.user,
          basic_info: {
            first_name: 'Jhon',
            last_name: 'Steave',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: ['1234567894534534534430', '0987654321',''],
            email: 'johne@xample.com',
          },
          auth_info: {
            password: 'password123',
          },
        };
    
        const signUpDto = plainToInstance(SignUpDto, validData);
        const errors = await validate(signUpDto);
        expect(errors.length).toBe(1);
      });

})

describe ('Update a User', () =>{
    it('should pass validation for valid data', async () => {
        const validData = {
          type: userTypes.user,
          basic_info: {
            first_name: 'John',
            last_name: 'Doe',
            dob: '1990-01-01',
            gender: 'MALE',
          },
          contact_info: {
            mobile_number: ['1234567890', '0987654321',''],
            email: 'john@example.com',
          },
          auth_info: {
            password: 'password123',
          },
        };
    
        const updateUserDto = plainToInstance(UpdateUserDto, validData);
        const errors = await validate(updateUserDto);
        expect(errors.length).toBe(0);
      });

})