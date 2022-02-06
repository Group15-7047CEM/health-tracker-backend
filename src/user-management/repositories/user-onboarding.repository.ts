import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize";
import { UserOnbardingProgressModel } from "../models";

@Injectable()
export class UserOnboardingRepository {
  constructor(
    @InjectModel(UserOnbardingProgressModel)
    private readonly userOnboardingModel: typeof UserOnbardingProgressModel,
    private readonly sequelize: Sequelize,
  ) {}


  async findByUserId(userId: string) {
    return await this.userOnboardingModel.findOne({
      where: {
        userId
      }
    })
  }

  async create(data): Promise<UserOnbardingProgressModel> {
    return await this.userOnboardingModel.create(data)
  }

  async updateById(id, data): Promise<UserOnbardingProgressModel> {
    return await this.userOnboardingModel.update(data, {
      where: {
        id
      },
      returning: true
    })
  }
}