import {
  Column,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { v4 as UUID } from 'uuid';
import { UserModel } from '.';
import { saveAuditLog } from '../../common/utils';

@Table({
  tableName: 'user_passwords',
  name: { plural: 'user_passwords', singular: 'user_password' },
  timestamps: true,
  paranoid: true,
  hooks: {
    afterUpdate: async function (instance, options) {
      await saveAuditLog('update', instance, options);
      return;
    },
    afterCreate: async function (instance, options) {
      await saveAuditLog('create', instance, options);
      return;
    },
  }
})
export class UserPasswordsModel extends Model<UserPasswordsModel> {
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
  password: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    references: {
      model: UserModel,
      key: 'id',
    },
  })
  userId: string;
}
