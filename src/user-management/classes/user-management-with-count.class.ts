import { ApiProperty } from '@nestjs/swagger';
import { classToPlain, Exclude, Expose } from 'class-transformer';
import { userRoles, userStatuses } from '../enums';

class ResponseFilter {
  @Expose({ groups: [...userRoles] })
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
    description: `User's Email ID`,
    example: 'patrick.bateman@yopmail.com',
  })
  @Expose({ groups: [...userRoles] })
  email: string;

  @ApiProperty({
    description: `Phone number`,
    example: '+919453453454',
  })
  @Expose({ groups: [...userRoles] })
  phoneNumber: string;

  @ApiProperty({
    description: `User's Last Login timestamp`,
    example: '',
  })
  @Expose({ groups: ['master_admin'] })
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
  @Expose({ groups: ['master_admin'] })
  role: string;

  @ApiProperty({
    description: `User Verification status`,
    example: true,
  })
  @Expose({ groups: ['master_admin'] })
  mobileVerified: boolean;

  @ApiProperty({
    description: 'Profile Image of the User.',
    type: 'string',
    example: 'image.png',
  })
  @Expose({ groups: ['master_admin', 'therapist'] })
  profileImage: string;

  @ApiProperty({
    description: 'Status of the User.',
    example: 'active',
    enum: userStatuses,
  })
  @Expose({ groups: ['participant', 'master_admin'] })
  status: string;

  @ApiProperty({
    description: 'Time when this User was created.',
    type: 'string',
    format: 'date-time',
    example: '2019-10-08T06:54:00.205Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Time when this User was updated.',
    type: 'string',
    format: 'date-time',
    example: '2019-10-08T06:54:00.205Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: `User's Email Verification status`,
    example: true,
  })
  @Expose({ groups: ['master_admin'] })
  emailVerified: boolean;

  @ApiProperty({
    description: `User's Login token`,
    example: 'true',
  })
  @Expose({ groups: ['master_admin'] })
  loginToken: string;

  @ApiProperty({
    description: `Email Verification token`,
    example: 'true',
  })
  @Expose({ groups: ['master_admin'] })
  emailVerifyToken: string;

  toJSON() {
    console.log(this.role, '::::::::::');
    return classToPlain(this, { groups: [this.role] });
  }
  constructor(partial: Partial<ResponseFilter>) {
    Object.assign(this, partial);
  }
}

export class UsersWithCount {
  @ApiProperty({
    description: 'Count of the total users.',
    type: 'number',
    example: 23,
  })
  count: number;

  @ApiProperty({
    description: 'Rows with users data.',
    type: 'array',
    items: { $ref: '#/components/schemas/User' },
    example: ResponseFilter,
  })
  users: Array<ResponseFilter>;

  constructor(users: Array<ResponseFilter>, count: number) {
    this.users = users;
    this.count = count;
  }
}
