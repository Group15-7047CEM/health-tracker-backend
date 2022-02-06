import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, classToPlain } from 'class-transformer';
import { userRoles, userStatuses } from '../enums';

export class User {
  id: string;

  @ApiProperty({
    description: `User's first name`,
    example: 'Patrick',
  })
  @Expose({ groups: [...userRoles] })
  firstName: string;

  @ApiProperty({
    description: `User's last name`,
    example: 'Bateman',
  })
  @Expose({ groups: [...userRoles] })
  lastName: string;

  @ApiProperty({
    description: `User's age`,
    example: 23,
  })
  @Expose({ groups: [...userRoles] })
  age: number;

  @ApiProperty({
    description: `User's nickname`,
    example: 'nick_name',
  })
  @Expose({ groups: [...userRoles] })
  nickname: string;

  @ApiProperty({
    description: `User's Email ID`,
    example: 'patrick.bateman@yopmail.com',
  })
  @Expose({
    groups: ['system_admin', 'therapist', 'project_manager', 'provider'],
  })
  email: string;

  @ApiProperty({
    description: `Phone number`,
    example: '+919453453454',
  })
  @Expose({ groups: ['system_admin', 'therapist'] })
  phoneNumber: string;

  @ApiProperty({
    description: `User's Last Login timestamp`,
    example: '',
  })
  @Expose({ groups: ['system_admin', 'participant'] })
  lastLoginAt: Date;

  @ApiProperty({
    description: `User's Password`,
    example: '12345678',
  })
  @Exclude()
  password: string;

  @ApiProperty({
    description: 'Role of the User.',
    example: 'participant',
    enum: userRoles,
  })
  @Expose({
    groups: ['system_admin', 'participant', 'project_manager', 'provider'],
  })
  role: string;

  @ApiProperty({
    description: `User Verification status`,
    example: true,
  })
  mobileVerified: boolean;

  @ApiProperty({
    description: 'Profile Image of the User.',
    type: 'string',
    example: 'image.png',
  })
  @Expose({
    groups: ['system_admin', 'therapist', 'project_manager', 'provider'],
  })
  profileImage: string;

  @ApiProperty({
    description: 'Status of the User.',
    example: 'active',
    enum: userStatuses,
  })
  status: string;

  @ApiProperty({
    description: 'Time when this User was created.',
    type: 'string',
    format: 'date-time',
    example: '2019-10-08T06:54:00.205Z',
  })
  @Expose({ groups: ['participant', 'system_admin'] })
  createdAt: Date;

  @ApiProperty({
    description: 'Time when this User was updated.',
    type: 'string',
    format: 'date-time',
    example: '2019-10-08T06:54:00.205Z',
  })
  @Expose({ groups: ['participant', 'system_admin'] })
  updatedAt: Date;

  @ApiProperty({
    description: `User's Email Verification status`,
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: `User's Login token`,
    example: 'true',
  })
  @Expose({ groups: [] })
  loginToken: string;

  @ApiProperty({
    description: `Email Verification token`,
    example: 'true',
  })
  @Expose({ groups: [] })
  emailVerifyToken: string;

  @ApiProperty({
    description: `User's Login status`,
    example: true,
  })
  @Expose({ groups: [] })
  isLoggedIn: boolean;

  @ApiProperty({
    description: `User's Login Role`,
    example: 'participant',
  })
  @Exclude()
  loggedInUserRole: string;

  toJSON() {
    return classToPlain(this, { groups: [this.loggedInUserRole] });
  }

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
