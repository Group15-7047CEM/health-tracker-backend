import { HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Op } from 'sequelize';
import { HttpErrorMessages } from 'src/common/constants';
import { BaseException } from 'src/common/exceptions';
import { ERROR_MESSAGES } from '../common/response-messages';
import { EducationLessonFavouriteModel, EducationLessonJournalModel, EducationLessonModel, EducationLessonUnitModel, ParticipantEducationLessonModel } from '../education-lessons/models';
import { UsersWithCount } from './classes';
import {
  GetUsersRequestDto,
  UpdateUserByIdRequestDto, UserManagementRequestDto
} from './dto';
import { CreateSearchEntryRequestDto } from './dto/create-search-entry.dto';
import { UserModel, UserSearchModel } from './models';
import {
  UserRepository, UserSearchRepository
} from './repositories';


@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userSearchRepo: UserSearchRepository,
  ) {}

  async globalSearch(query): Promise<any> {
    const results = await EducationLessonModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      attributes: [ 'id', 'name', 'description', 'imageUrl']
    })

    return {
      hits: results.length,
      results: results
    }
  }

  /**
   * Gets recent searches
   * @param userId 
   * @returns {Promise<UserSearchModel[]>} searchList
   */
  async getRecentSearches(userId: string): Promise<UserSearchModel[]> {
    return await this.userSearchRepo.findRecentByUserId(userId)
  }

  /**
   * create search entry
   * @param userId 
   * @returns {Promise<UserSearchModel>} searchEntry
   */
  async createSearchEntry(userId: string, data: CreateSearchEntryRequestDto): Promise<UserSearchModel> {
    return await this.userSearchRepo.create(userId, data)
  }

  /**
   * Removes search entry
   * @param {string} id 
   * @param {string} userId 
   * @returns {Promise<boolean>} search entry 
   */
  async removeSearchEntry(id: string, userId: string): Promise<boolean> {
    const deletedEntry = await this.userSearchRepo.remove(id, userId)
    if (!deletedEntry) {
      throw new BaseException(ERROR_MESSAGES.search_entry_not_found)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }
    return null
  }

  async getJournals(participantId: string) {
    const educationLessons = await ParticipantEducationLessonModel.findAll({
      where: {
        participantId
      },
      attributes: [ 'educationLessonId' ]
    })
    const educationLessonsIds = educationLessons.map(lesson => {
      return lesson.educationLessonId
    })

    return await EducationLessonModel.findAll({
      where: {
        id: educationLessonsIds
      },
      include: [
        {
          model: EducationLessonUnitModel,
          attributes: ['id', 'title', 'description'],
          include: [
            {
              model: EducationLessonJournalModel,
              where: {
                participantId
              },
              attributes: ['id', 'value'],
              required: false
            }
          ]
        }
      ]
    })
  }

  async getFavourites(participantId: string) {
    return await EducationLessonFavouriteModel.findAll({
      where: {
        participantId
      },
      include: [
        {
          model: EducationLessonModel
        }
      ]
    })
  }

  async createUser(userData: UserManagementRequestDto): Promise<UserModel> {
    const salt = crypto
      .randomBytes(16)
      .toString('base64') as crypto.HashOptions;
    if (userData.password) {
      const hash = crypto
        .createHash('sha512', salt)
        .update(userData.password)
        .digest('base64');
      userData.password = salt + '$' + hash;
    }
    userData.lastLoginAt = new Date();

    return await this.userRepo.findOrCreate(userData);
  }

  /**
   * Insert a User record directly (Mock data)
   * - email/mobile verified + 'active'
   */
  async insertUser(userData: any): Promise<UserModel> {
    const salt = crypto
      .randomBytes(16)
      .toString('base64') as crypto.HashOptions;
    userData['password'] = userData.password || '12345678';
    const hash = crypto
      .createHash('sha512', salt)
      .update(userData.password)
      .digest('base64');
    userData.password = salt + '$' + hash;
    userData['emailVerified'] = true;
    userData['mobileVerified'] = true;
    userData['status'] = 'active';
    return await this.userRepo.findOrCreate(userData);
  }

  async findExistingUser(
    email: string,
    phoneNumber?: string,
  ): Promise<UserModel | undefined> {
    return this.userRepo.findExistingUser(email);
  }

  async findByEmail(email: string): Promise<UserModel | undefined> {
    return this.userRepo.findOneByEmail(email);
  }

  async findByEmailAndRole(email: string, role: string): Promise<UserModel> {
    return await UserModel.findOne({
      where: {
        email: { [Op.iLike]: email },
        role,
      },
    });
  }

  async findById(
    id: string,
    scopes?: Array<string>,
  ): Promise<UserModel | undefined> {
    return this.userRepo.findOneById(id);
  }

  async getUserMiscById(id: string, scopes: Array<string>): Promise<any> {
    const user = await this.userRepo.findOneById(id, scopes);
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      designation: user.miscFields ? user.miscFields.designation : null,
      hospitalAddress: user.miscFields ? user.miscFields.hospitalAddress : null,
      hospitalName: user.miscFields ? user.miscFields.hospitalName : null,
    };
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserModel | undefined> {
    return this.userRepo.findOneByPhoneNumber(phoneNumber);
  }

  async updatePasswordById(
    password: string,
    id: string,
  ): Promise<UserModel | undefined> {
    const updatedObj = await this.userRepo.updatePasswordById(password, id);

    if (updatedObj && updatedObj[0] > 0) {
      updatedObj[1][0].password = undefined;
      return updatedObj[1][0];
    }
  }

  async updateUserById(
    updateData: UpdateUserByIdRequestDto,
    id: string,
    userRole?: string,
    reqUserId?: string
  ): Promise<UserModel | undefined> {
    if (updateData.status) {
      const user = await this.userRepo.findOneById(id);
      if (userRole !== 'system_admin') {
        throw new BaseException(ERROR_MESSAGES.invalid_user)
          .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
          .setStatusCode(HttpStatus.BAD_REQUEST)
          .getException();
      }
      if (!user.emailVerified) {
        throw new BaseException(ERROR_MESSAGES.user_email_not_verified)
          .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
          .setStatusCode(HttpStatus.BAD_REQUEST)
          .getException();
      }
      if (!user.mobileVerified) {
        throw new BaseException(ERROR_MESSAGES.user_not_verified)
          .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
          .setStatusCode(HttpStatus.BAD_REQUEST)
          .getException();
      }
    }
    const updatedObj = await this.userRepo.updateUserById(updateData, id, reqUserId);
    if (updateData.status === 'inactive') {
      // Clear user session in mobile (on user deactivation)
      // await this.notificationService.sendAllNotifications(
      //   id,
      //   'user_deactivated',
      // );
    }
    if (updatedObj && updatedObj[0] > 0) {
      const toReturn = await this.userRepo.findOneById(id);
      toReturn.password = undefined;
      toReturn.passwords = undefined;
      return toReturn;
    } else {
      throw new BaseException(`Update failed`)
        .setName(HttpErrorMessages[HttpStatus.INTERNAL_SERVER_ERROR])
        .setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR)
        .getException();
    }
  }

  async deleteUserById(id: string): Promise<UserModel> {
    const deletedUser = await this.userRepo.deleteById(id);

    if (!deletedUser) {
      throw new BaseException(`No User exists with the id ${id}.`)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }
    return null;
  }

  async getUsers(
    data: GetUsersRequestDto,
    userRole?: any,
  ): Promise<UsersWithCount> {
    const users = await this.userRepo.getAll(data, userRole);
    return users;
  }

  async getUsersWithExpiredPasswords(expiryDate) {
    const users = await UserModel.findAll({
      where: {
        expirePasswordAt: {
          [Op.eq]: `${expiryDate}`,
        },
      },
    });
    return users;
  }
}
