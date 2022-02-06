import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { User, UsersWithCount } from '../classes';
import {
  GetUsersRequestDto,
  UpdateUserByIdRequestDto, UserManagementRequestDto
} from '../dto';
import { UserModel, UserPasswordsModel } from '../models';

const PASSWORD_EXPIRY_DAYS = 90;

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(UserPasswordsModel)
    private readonly userPasswordsModel: typeof UserPasswordsModel,
    private readonly sequelize: Sequelize,
  ) {}
  async findOrCreate(userData: UserManagementRequestDto): Promise<UserModel> {
    return await this.sequelize.transaction(async t => {
      const dbOptions = { transaction: t };
      let expirePasswordAt;
      if (userData.password) {
        expirePasswordAt = this.getNewPasswordExpiryDate();
      }
      const user = await this.userModel.findOrCreate({
        where: {
          [Op.or]: [
            { email: { [Op.iLike]: `%${userData.email}%` } },
            // { phoneNumber: userData.phoneNumber },
          ],
        },
        ...dbOptions,
        defaults: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          // phoneNumber: userData.phoneNumber,
          password: userData.password,
          role: userData.role,
          mobileVerified: userData.mobileVerified,
          status: userData.status,
          emailVerified: userData.emailVerified,
          emailVerifyToken: userData.emailVerifyToken,
          expirePasswordAt,
        },
      });
      if (user[1] && user[0].password) {
        await this.userPasswordsModel.create(
          { userId: user[0].id, password: user[0].password },
          dbOptions,
        );
      }
      return user;
    });
  }

  async findExistingUser(email: string, phoneNumber?: string): Promise<any> {
    return await this.userModel.findOne({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: `%${email}%` } },
          // { phoneNumber: phoneNumber },
        ],
      },
    });
  }

  async findOneByEmail(email: string): Promise<UserModel> {
    return await this.userModel.findOne({
      where: {
        email,
      },
    });
  }

  async findOneById(id: string, scopes?: Array<string>): Promise<any> {
    return await this.userModel.scope(scopes).findOne({
      where: { id },
      include: [
        {
          model: UserPasswordsModel,
          as: 'passwords',
        },
      ],
    });
  }

  async findOneByPhoneNumber(phoneNumber: string): Promise<UserModel> {
    return await this.userModel.findOne({
      where: { phoneNumber },
    });
  }

  private getNewPasswordExpiryDate() {
    // set password expire at (90 days)
    let currentDatetime = new Date();
    currentDatetime = new Date(
      currentDatetime.setDate(currentDatetime.getDate() + PASSWORD_EXPIRY_DAYS),
    );
    const year = currentDatetime.getFullYear();
    let month = `${currentDatetime.getMonth() + 1}`;
    month = month.length === 1 ? '0' + month : month;
    let day = `${currentDatetime.getDate()}`;
    day = day.length === 1 ? '0' + day : day;
    const currentDate = year + '-' + month + '-' + day;
    return currentDate;
  }

  async updatePasswordById(password: string, id: string): Promise<UserModel> {
    return await this.sequelize.transaction(async t => {
      const dbOptions = { transaction: t };
      const expirePasswordAt = this.getNewPasswordExpiryDate();
      await this.userPasswordsModel.create({ userId: id, password }, dbOptions);
      return await this.userModel.update(
        { password, expirePasswordAt },
        {
          where: { id },
          returning: true,
          ...dbOptions,
          individualHooks: true,
          // authUserId: id
        },
      );
    });
  }

  async updateUserById(
    updateData: UpdateUserByIdRequestDto,
    id: string,
    reqUserId?: string
  ): Promise<UserModel> {
    return await this.userModel.update(updateData, {
      where: { id },
      individualHooks: true,
      // authUserId: reqUserId
    });
  }

  async deleteById(id: string): Promise<UserModel> {
    const user = await this.findOneById(id);
    return user;
  }

  async getAll(
    data?: GetUsersRequestDto,
    userRole?: any,
  ): Promise<UsersWithCount> {
    let whereClause = {};
    let offset = 0,
      limit = 10;
    const sortOrder = [];
    const { sortBy, orderBy } = data;

    if (data.page && data.size) {
      offset = data.page * data.size - data.size;
      limit = data.size;
    }

    if (data.search) {
      // Replacing the %20 to space string
      data.search = data.search.replace('%20', ' ');

      /**
       * Concatenate a space string in between first and last names to make this work correctly.
       * Otherwise it would only return for 'JohnDoe' and not for 'John Doe'.
       * link: https://stackoverflow.com/questions/32752840/sequelize-concat-fields-in-where-like-clause
       */

      whereClause = {
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn(
              'concat',
              Sequelize.col('UserModel.firstName'),
              ' ',
              Sequelize.col('UserModel.lastName'),
            ),
            {
              [Op.iLike]: `%${data.search}%`,
            },
          ),
        ],
        ...whereClause,
      };
    }

    if (data.role) {
      Object.assign(whereClause, { role: data.role });
      whereClause = {
        role: data.role,
        ...whereClause,
      };
    }
    if (data.status) {
      Object.assign(whereClause, { status: data.status });
    }

    switch (sortBy) {
      case 'firstName':
        sortOrder.push([sortBy, orderBy || 'ASC']);
        break;
      default:
        sortOrder.push(['createdAt', 'DESC']);
    }


    const users = await this.userModel.findAndCountAll({
      attributes: { exclude: ['password'] },
      where: whereClause,
      offset,
      limit,
      order: sortOrder,
      distinct: true,
    });

    users.rows = users.rows.map(user => {
      user.dataValues.loggedInUserRole = userRole;
      return new User(user.toJSON());
    });

    return {
      count: users.count,
      users: users.rows,
    };
  }
}
