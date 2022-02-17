import {
  Column, DataType, HasMany, Model, Scopes, Table
} from 'sequelize-typescript';
import { replaceWithSignedUrls } from 'src/common/utils';
import { v4 as UUID } from 'uuid';
import { userStatuses } from '../enums';
import { UserConsentModel } from './user-consent.model';
import { UserDeviceTokenModel } from './user-device-token.model';
import { UserPasswordsModel } from './user-passwords.model';



@Scopes(() => ({
  
}))
@Table({
  tableName: 'users',
  name: { plural: 'users', singular: 'user' },
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['phoneNumber'],
      where: {
        deletedAt: null,
      },
    },
    {
      unique: true,
      fields: ['email'],
      where: {
        deletedAt: null,
      },
    },
  ],
  hooks: {
    // afterUpdate: async function (instance, options) {
    //   await saveAuditLog('update', instance, options);
    //   return;
    // },
    // afterCreate: async function (instance, options) {
    //   await saveAuditLog('create', instance, options);
    //   return;
    // },
    afterFind: async function(instances: any) {
      await replaceWithSignedUrls(instances, ['profileImage']);
      return;
    },
    afterDestroy: async function(instance: any) {
      return;
    },
  },
})
export class UserModel extends Model<UserModel> {
  @Column({
    unique: true,
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: UUID,
  })
  id: string;

  @Column({ type: DataType.STRING })
  firstName: string;

  @Column({ type: DataType.STRING })
  lastName: string;

  @Column({
    type: DataType.STRING
  })
  email: string;

  @Column({
    type: DataType.STRING
  })
  phoneNumber: string;

  @Column({ type: DataType.STRING })
  loginToken: string;

  @Column({ type: DataType.DATE })
  lastLoginAt: Date;

  @Column({ type: DataType.STRING })
  password: string;

  @Column({ type: DataType.DATEONLY })
  expirePasswordAt: string;

  @Column({
    type: DataType.STRING,
    // values: userRoles,
  })
  role: string;

  @Column({
    type: DataType.STRING,
    // values: userStatuses,
    defaultValue: userStatuses[0], // Set active by default
  })
  status: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  mobileVerified: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isLoggedIn: boolean;

  @Column({
    type: DataType.STRING,
  })
  profileImage: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified: boolean;

  @Column({
    type: DataType.STRING,
  })
  emailVerifyToken: string;

  @Column({
    type: DataType.TEXT,
  })
  address: string;

  @Column({
    type: DataType.STRING,
  })
  city: string;

  @Column({
    type: DataType.STRING,
  })
  country: string;

  @Column({
    type: DataType.STRING,
  })
  postcode: string;

  @Column({
    type: DataType.STRING,
  })
  gender: string;

  @Column({
    type: DataType.DATEONLY,
  })
  dob: string;

  @Column({
    type: DataType.FLOAT,
  })
  currentWeight: number;

  @Column({
    type: DataType.FLOAT,
  })
  height: number;

  @HasMany(() => UserConsentModel, 'userId')
  userConsents?: UserConsentModel[];

  // User < 1:n > UserDeviceToken
  @HasMany(() => UserDeviceTokenModel, {
    foreignKey: 'userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    hooks: true,
  })
  deviceTokens?: UserDeviceTokenModel[];

  @HasMany(() => UserPasswordsModel, {
    foreignKey: 'userId',
  })
  passwords?: UserPasswordsModel[];
}
