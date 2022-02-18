import { Injectable, HttpStatus, Optional } from '@nestjs/common';
import { Sequelize as SequelizeTS } from 'sequelize-typescript';
import { UserHealthMetricModel} from './models';
import { Op } from 'sequelize';

@Injectable()
export class HealthTrackingService {
  constructor(
    // private readonly projectsRepo: ProjectsRepository,
    private readonly sequelize: SequelizeTS,
    // private readonly participantGroupService: ParticipantGroupService,

  ) {}

  getDaysBetween(startDate, endDate) {
    // The number of milliseconds in all UTC days (no DST)
    const oneDay = 1000 * 60 * 60 * 24;
    // A day in UTC always lasts 24 hours (unlike in other time formats)
    const start = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const end = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    // so it's safe to divide by 24 hours
    return (start - end) / oneDay;
  }

  // Generate date key 'MMM dd'
  // Replaces use of moment.js
  private getDateKey(date) {
    const d = date.getDate();
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return m[date.getMonth()] + ' ' + ((d<10?'0':'') + d);
  }


  // Generate an array in format [{day:'MMM dd', times:[d0, d1, ...]}, ...]
  // Replaces use of underscore.js
  private getUniqueDays(dates) {
    const obj = dates.reduce((acc, d) => {
      const p = this.getDateKey(d);
      if (!acc[0].hasOwnProperty(p)) acc[0][p] = [];
      acc[0][p].push(d);
      return acc;
    },[{}])
    .reduce((acc, v) => {
      Object.keys(v).forEach((k) => {acc.push({day:k, times:v[k]})});
      return acc;
    },[]);
    return obj;
  }

  async addWeightTracking(userId: string, data: any) {
    data['userId'] = userId;
    const {item, created} = await this.updateOrCreate(
      UserHealthMetricModel, 
      { userId, trackedDate: data.trackedDate },
      data
    );
    // await this.sendNotificationsOnTrackedAction(userId, 'weight', data);
    return item;
  }

  async addWaterTracking(userId: string, data: any) {
    data['userId'] = userId;
    let healthMetric = await UserHealthMetricModel.findOne({where: {userId, trackedDate: data.trackedDate}});
    if (!healthMetric) {
      // Item not found, create a new one
      healthMetric = await UserHealthMetricModel.create(data);
    } else {
      let totalWaterIntake = healthMetric.waterIntake + data.waterIntake;
      healthMetric.waterIntake = totalWaterIntake;
      await healthMetric.save();
    }
    return healthMetric;
  }

  findMinutesBetweenDatetimes(startTime, endTime) {
    startTime = new Date(startTime); 
    endTime = new Date(endTime);
    let difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
    let resultInMinutes = Math.round(difference / 60000);
    return resultInMinutes;
  }

  async addSleepTracking(userId: string, data: any) {
    data['userId'] = userId;
    const { sleepStartTime, sleepEndTime } = data;
    const sleepMinutes = this.findMinutesBetweenDatetimes(sleepStartTime, sleepEndTime);
    data['sleepMins'] = sleepMinutes;
    const {item, created} = await this.updateOrCreate(
      UserHealthMetricModel, 
      { userId, trackedDate: data.trackedDate },
      data
    );
    // await this.sendNotificationsOnTrackedAction(userId, 'weight', data);
    return item;
  }

  async addStepTracking(userId: string, data: any) {
    data['userId'] = userId;
    const {item, created} = await this.updateOrCreate(
      UserHealthMetricModel, 
      { userId, trackedDate: data.trackedDate },
      data
    );
    // await this.sendNotificationsOnTrackedAction(userId, 'steps', data);
    return item;
  }
  
  async getWaterIntakeReadings(userId: string, queryParams: any) {
    const {startDate, endDate, page, size} = queryParams;

    const waterReadings = await UserHealthMetricModel.findAndCountAll({
      where: {
        userId,
        trackedDate: {
          // [Op.between]: [`${date} 00:00:00.00+00`, `${date} 24:00:00.00+00`],
          [Op.between]: [startDate, endDate],
        }
      },
      attributes: ['trackedDate', 'waterIntake'],
      order: [['trackedDate', 'DESC']],
    });
    return {
      waterReadings: waterReadings.rows,
      count: waterReadings.count
    };
  }

  async getWeightReadings(userId: string, queryParams: any) {
    const {startDate, endDate, page, size} = queryParams;

    const weightReadings = await UserHealthMetricModel.findAndCountAll({
      where: {
        userId,
        trackedDate: {
          // [Op.between]: [`${date} 00:00:00.00+00`, `${date} 24:00:00.00+00`],
          [Op.between]: [startDate, endDate],
        }
      },
      attributes: ['trackedDate', 'weight'],
      order: [['trackedDate', 'DESC']],
    });
    return {
      weightReadings: weightReadings.rows,
      count: weightReadings.count
    };
  }

  async getStepReadings(userId: string, queryParams: any) {
    const {startDate, endDate, page, size} = queryParams;

    const stepReadings = await UserHealthMetricModel.findAndCountAll({
      where: {
        userId,
        trackedDate: {
          // [Op.between]: [`${date} 00:00:00.00+00`, `${date} 24:00:00.00+00`],
          [Op.between]: [startDate, endDate],
        }
      },
      attributes: ['trackedDate', 'steps', 'activityMins'],
      order: [['trackedDate', 'DESC']],
    });
    return {
      stepReadings: stepReadings.rows,
      count: stepReadings.count
    };
  }

  async getSleepReadings(userId: string, queryParams: any) {
    const {startDate, endDate, page, size} = queryParams;

    const sleepReadings = await UserHealthMetricModel.findAndCountAll({
      where: {
        userId,
        trackedDate: {
          // [Op.between]: [`${date} 00:00:00.00+00`, `${date} 24:00:00.00+00`],
          [Op.between]: [startDate, endDate],
        }
      },
      attributes: ['trackedDate', 'sleepStartTime', 'sleepEndTime', 'sleepMins'],
      order: [['trackedDate', 'DESC']],
    });
    return {
      sleepReadings: sleepReadings.rows,
      count: sleepReadings.count
    };
  }

  private async updateOrCreate (model, where, newItem) {
    // First try to find the record
    return model
    .findOne({where: where})
    .then( (foundItem) => {
        if (!foundItem) {
          // Item not found, create a new one
          return model
              .create(newItem)
              .then( (item) => { return  {item: item, created: true}; })
        }
        // Found an item, update it
      return model
          .update(newItem, {where: where, returning: true})
          .then( (updated) => { 
            if (updated[0]) {
              return {item: updated[1][0], created: false} 
            } else {
              return {item: null, created: false}
            }
          }) ;
    });
  }

}
