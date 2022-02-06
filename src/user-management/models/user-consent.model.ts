import {
  BelongsTo, Column, DataType, ForeignKey, Model,
  Table
} from 'sequelize-typescript';
import { replaceWithSignedUrls } from 'src/common/utils';
import { v4 as UUID } from 'uuid';
import { UserModel } from '.';

@Table({
  tableName: 'user_consents',
  name: { plural: 'user_consents', singular: 'user_consent' },
  timestamps: true,
  paranoid: true,
  hooks: {
    afterFind: async function(instances: any) {
      await replaceWithSignedUrls(instances, ['signatureImage']);
      return;
    },
  },
})
export class UserConsentModel extends Model<UserConsentModel> {
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
    type: DataType.STRING,
  })
  email: string;

  @Column({
    type: DataType.STRING,
  })
  phoneNumber: string;

  @Column({ type: DataType.TEXT })
  additionalInfo: string;

  @Column({ type: DataType.DATE })
  submittedAt: Date;

  @Column({ type: DataType.STRING })
  signatureImage: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
  })
  userId: string;
  @BelongsTo(() => UserModel, 'userId')
  user: UserModel;
}
