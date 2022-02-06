import {
  BelongsTo, Column, DataType, ForeignKey, Model,
  Table
} from 'sequelize-typescript';
import { v4 as UUID } from 'uuid';
import { UserModel } from './users.model';


@Table({
  tableName: 'user_searches',
  name: { plural: 'user_searches', singular: 'user_searches' },
  timestamps: true,
  paranoid: false,
})
export class UserSearchModel extends Model<UserSearchModel> {
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
    allowNull: false
  })
  keyword: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1
  })
  hits: number;


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
