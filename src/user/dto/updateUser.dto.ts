import { IsString, IsNotEmpty, IsEmail, IsEnum,ValidateNested, isArray, IsArray, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UniqueArray } from '../../constants/unique-array.constraint';


class BasicInfo {
    @MaxLength(25)
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @MaxLength(25)
    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    dob: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    @IsEnum(['MALE','FEMALE'])
    gender: string;
  }

  
  class ContactInfo {
    @UniqueArray()
    @IsArray()
    @MaxLength(15, { each: true })
    mobile_number: string[];

    @Transform(({ value }) => value.trim())
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

  }

  class AuthInfo {
    @Transform(({ value }) => value.trim())
    @IsString()
    password: string;

  }

class UpdateUserDto  {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  type: string ;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BasicInfo)
  basic_info: BasicInfo;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ContactInfo)
  contact_info: ContactInfo;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthInfo)
  auth_info: AuthInfo;
 
}

export default UpdateUserDto ;