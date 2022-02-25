import { Column, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { v4 as UUID } from 'uuid';
import { UserModel } from '../../user-management/models';

@Table({
  tableName: 'user_health_metrics',
  name: { plural: 'user_health_metrics', singular: 'user_health_metric' },
  timestamps: true,
  paranoid: true
})
export class UserHealthMetricModel extends Model<UserHealthMetricModel> {
  @Column({
    unique: true,
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: UUID
  })
  id: string;

  @Column({type: DataType.FLOAT})
  weight: number; // in kg

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  steps: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  waterIntake: number; // in ml

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  activityMins: number; // in mins

  @Column({
    type: DataType.DATE,
  })
  sleepStartTime: string; // datetime

  @Column({
    type: DataType.DATE,
  })
  sleepEndTime: string; // datetime
  
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  sleepMins: number; // in mins

  @Column({
    type: DataType.ARRAY(DataType.JSON),
    defaultValue: []
  })
  foodItems: object[]; // food, calories

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  totalCalories: number; 

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  trackedDate: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID
  })
  userId: string;
  @BelongsTo(() => UserModel, 'userId')
  user: UserModel;
}
