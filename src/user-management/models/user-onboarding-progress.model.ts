import {
  BelongsTo, Column, DataType, ForeignKey, Model,
  Table
} from 'sequelize-typescript';
import { v4 as UUID } from 'uuid';
import { UserModel } from './users.model';


@Table({
  tableName: 'user_onboarding_progress',
  name: { plural: 'user_onboarding_progress', singular: 'user_onboarding_progress' },
  timestamps: true,
  paranoid: false,
})
export class UserOnbardingProgressModel extends Model<UserOnbardingProgressModel> {
  @Column({
    unique: true,
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: UUID,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  currentStep: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  nextStep: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false
  })
  data: Map<string, any>;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
    
  })
  completed: boolean;


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
