import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsEmail } from 'class-validator';
import userTypes from '../constants/user_types';
import statuses from '../constants/statuses';


// Basic Info
@Schema({ _id: false })
export class BasicInfo {
  @Prop({ required: true, trim: true })
  first_name: string;

  @Prop({ required: true, trim: true })
  last_name: string;

  @Prop({ trim: true })
  dob: string;

  @Prop({ required: true, trim: true })
  gender: string;
}

// Contact info
@Schema({ _id: false })
export class ContactInfo {

//Changed -----------------------------------
  @Prop({ trim: true })
  mobile_number: string[];


  @Prop({ required: true, trim: true,unique:true,lowercase:true })
  @IsEmail()
  email: string;

  
}

// Auth info
@Schema({ _id: false })
export class AuthInfo {
  @Prop({ trim: true })
  password: string;
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    trim: true,
    enum: [userTypes.admin, userTypes.user],
  })
  type: string;
  
  @Prop({ 
    trim: true})
  fcmToken: string;

  @Prop({
    trim: true,
    enum: [statuses.active, statuses.inactive, statuses.onboard],
    default: statuses.onboard,
  })
  status: string;

  @Prop({ required: true })
  basic_info: BasicInfo;

  @Prop({ required: true })
  contact_info: ContactInfo;

  @Prop({ required: true })
  auth_info: AuthInfo;
}

export const UserSchema = SchemaFactory.createForClass(User);