import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { CreateSearchEntryRequestDto } from "../dto/create-search-entry.dto";
import { UserSearchModel } from "../models";

@Injectable()
export class UserSearchRepository {
  constructor(
    @InjectModel(UserSearchModel)
    private readonly userSearchModel: typeof UserSearchModel,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Creates user search entry
   * @param {string} userId 
   * @param {CreateSearchEntryRequestDto} data 
   * @returns {Promise<UserSearchModel>} searchEntry
   */
  async create(userId: string, data: CreateSearchEntryRequestDto): Promise<UserSearchModel> {
    const search = await this.userSearchModel.findOrCreate({
      where: {
        userId,
        keyword: data.keyword
      },
      defaults: {
        keyword: data.keyword
      },
    });

    if (!search[1]) {
      await this.userSearchModel.update({ hits: ( +search[0].hits + 1 ) }, {
        where: {
          id: search[0].id
        }
      })
    }

    return search[0]
  }

  /**
   * Removes user search entry
   * @param {string} id 
   * @param {string} userId 
   * @returns {Promise<UserSearchModel>} entry
   */
  async remove(id, userId): Promise<UserSearchModel> {
    return await this.userSearchModel.destroy({
      where: {
        id,
        userId
      }
    })
  }

  /**
   * Find recent searches
   * 
   * @param {string} userId 
   * @returns {Promise<UserSearchModel[]>} searchList
   */
  async findRecentByUserId(userId: string): Promise<UserSearchModel[]> {
    return await this.userSearchModel.findAll({
      where: {
        userId
      },
      order: [ ['updatedAt', 'DESC']]
    })
  }
}