import { IsString, IsOptional } from 'class-validator';

class UpdateUserFcmDto {
  @IsString()
  @IsOptional()
  fcmToken?: string;

}

export default UpdateUserFcmDto;