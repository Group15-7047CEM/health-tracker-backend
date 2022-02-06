import {
  BelongsTo, Column, DataType, ForeignKey, Model,
  Table
} from 'sequelize-typescript';
import { v4 as UUID } from 'uuid';
import { deviceTokenTypes } from '../enums';
import { UserModel } from './users.model';


@Table({
  tableName: 'user_device_tokens',
  name: { plural: 'user_device_tokens', singular: 'user_device_token' },
  timestamps: true,
  paranoid: true,
})
export class UserDeviceTokenModel extends Model<UserDeviceTokenModel> {
  @Column({
    unique: true,
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: UUID,
  })
  id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: true,
  })
  deviceToken: string;

  @Column({
    type: DataType.ENUM,
    values: deviceTokenTypes,
    allowNull: false,
    defaultValue: deviceTokenTypes[0],
  })
  tokenType: string;

  // User < 1:n > DeviceTokens
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    references: {
      model: UserModel,
      key: 'id',
    },
  })
  userId: string;
  @BelongsTo(() => UserModel, 'userId')
  user: UserModel;
}
