import {
  Controller, UsePipes, Body, Query, Param,
  Post, Get, UseGuards, Delete, Put,
} from '@nestjs/common';

import {
  addWeightTracking, addStepTracking, getWaterIntakeReadings, getStepReadings, getWeightReadings, addWaterTracking, addSleepTracking, getSleepReadings, addFoodTracking, getFoodReadings,
} from './schemas';
import { JoiValidationPipe } from 'src/common/pipes';
import { DataResponseBuilder, DataResponseSkeleton } from 'src/common/http/response-builders/data';
import {ErrorResponseBuilder} from '../common/http/response-builders/error';
import { BaseException } from 'src/common/exceptions';
import { GetUser } from '../common/decorators';
import { JwtAuthGuard } from 'src/authentication/guards';
import { HealthTrackingService } from './health-tracking.service';

@Controller('health-tracking')
export class HealthTrackingController {

  constructor(
    private readonly healthTrackingService: HealthTrackingService
    ) {}

  @Post('weight')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(addWeightTracking))
  async addWeightTracking(@Body() data: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const weightTracked = await this.healthTrackingService.addWeightTracking(userId, data);
      return new DataResponseBuilder().createdResponse(weightTracked, 'Tracked weight successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Get('weight')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(getWeightReadings))
  async getWeightReadings(@Query() queryParams: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const weightReadings = await this.healthTrackingService.getWeightReadings(userId, queryParams);
      return new DataResponseBuilder().successResponse(weightReadings, 'Retrieved weight readings successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }
  
  @Post('water')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(addWaterTracking))
  async addWaterTracking(@Body() data: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const waterTracked = await this.healthTrackingService.addWaterTracking(userId, data);
      return new DataResponseBuilder().createdResponse(waterTracked, 'Tracked water successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Get('water')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(getWaterIntakeReadings))
  async getWaterIntakeReadings(@Query() queryParams: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const waterIntakeReadings = await this.healthTrackingService.getWaterIntakeReadings(userId, queryParams);
      return new DataResponseBuilder().successResponse(waterIntakeReadings, 'Retrieved water readings successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Post('steps')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(addStepTracking))
  async addStepTracking(@Body() data: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const stepsTracked = await this.healthTrackingService.addStepTracking(userId, data);
      return new DataResponseBuilder().createdResponse(stepsTracked, 'Tracked steps successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Get('steps')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(getStepReadings))
  async getStepReadings(@Query() queryParams: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const stepReadings = await this.healthTrackingService.getStepReadings(userId, queryParams);
      return new DataResponseBuilder().successResponse(stepReadings, 'Retrieved step readings successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Post('sleep')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(addSleepTracking))
  async addSleepTracking(@Body() data: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const sleepTracked = await this.healthTrackingService.addSleepTracking(userId, data);
      return new DataResponseBuilder().createdResponse(sleepTracked, 'Tracked sleep successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Get('sleep')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(getSleepReadings))
  async getSleepReadings(@Query() queryParams: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const sleepReadings = await this.healthTrackingService.getSleepReadings(userId, queryParams);
      return new DataResponseBuilder().successResponse(sleepReadings, 'Retrieved sleep readings successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Post('food')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(addFoodTracking))
  async addFoodTracking(@Body() data: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const foodTracked = await this.healthTrackingService.addFoodTracking(userId, data);
      return new DataResponseBuilder().createdResponse(foodTracked, 'Tracked food successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Get('food')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(getFoodReadings))
  async getFoodReadings(@Query() queryParams: any, @GetUser('id') userId: string): Promise<DataResponseSkeleton<any>> {
    try {
      const foodReadings = await this.healthTrackingService.getFoodReadings(userId, queryParams);
      return new DataResponseBuilder().successResponse(foodReadings, 'Retrieved food readings successfully!');
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

}
