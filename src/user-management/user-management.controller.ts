import {
  Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpStatus, Inject, Param, Post, Put, Query, UseGuards, UseInterceptors, UsePipes
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiCreatedResponse, ApiOkResponse,
  ApiOperation, ApiTags
} from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { JwtAuthGuard, RolesGuard } from 'src/authentication/guards';
import { GetUser, Roles } from 'src/common/decorators';
import { BaseException } from 'src/common/exceptions';
import { HttpErrorMessages } from '../common/constants';
import {
  DataResponseBuilder,
  DataResponseSkeleton
} from '../common/http/response-builders/data';
import { ErrorResponseBuilder } from '../common/http/response-builders/error';
import { JoiValidationPipe } from '../common/pipes';
import { SUCCESS_MESSAGES } from '../common/response-messages';
import {
  sendEmailWithSendgrid,
  sendTwilioSMS
} from '../common/utils';
import { AuthenticationService } from './../authentication/authentication.service';
import { User, UsersWithCount } from './classes';
import {
  DeleteUserResponseDto, GetUserByIdResponseDto, GetUsersRequestDto, GetUsersResponseDto, InsertOneUserRequestDto, UpdateUserByIdRequestDto, UpdateUserByIdResponseDto, UserManagementRequestDto, UserManagementResponseDto
} from './dto';
import { CreateSearchEntryRequestDto } from './dto/create-search-entry.dto';
import { userRoles, userStatuses } from './enums';
import { UserOnboardingService } from './providers/onboarding.service';
import {
  createSearchEntry,
  getUsersValidationSchema, globalSearch, insertOneUserSchema, progressOnboard, updateUserByIdSchema, userManagementValidationSchema
} from './schemas';
import { UserManagementService } from './user-management.service';


@Controller('users')
export class UserManagementController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userService: UserManagementService,
    private authenticationService: AuthenticationService,
    private onboardService: UserOnboardingService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UsePipes(new JoiValidationPipe(userManagementValidationSchema))
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: UserManagementResponseDto })
  @ApiTags('Users')
  async createUser(
    @GetUser('id') userId: string,
    @Body() userData: UserManagementRequestDto,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      userData['status'] = userStatuses[1]; // Set as inactive by default
      userData.creatorId = userId; // Set creator Identifier
      const user = await this.userService.createUser(userData);
      if (!user[1]) {
        throw new BaseException('This email or phone number already exists.')
          .setName(HttpErrorMessages[HttpStatus.CONFLICT])
          .setStatusCode(HttpStatus.CONFLICT)
          .getException();
      }
      user[0].dataValues.password = undefined;

      // TODO: Removed as already triggered during OTP verification. Verify once.
      // if (user[0].role == "participant") {
      //   await this.participantService.addParticipantToDefaultGroup(user[0].id);
      // }

      const token = this.jwtService.sign(user[0].id);

      // Send OTP to phone number
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      // TODO: Static OTP
      // const randomNumber = 654321;
      // send otp to registered number if no user found in db with the details
      // await this.authenticationService.sendOtp(user[0].phoneNumber, randomNumber);
      await sendTwilioSMS({
        phoneNumber: user[0].phoneNumber,
        otp: randomNumber,
      });
      // set the user details in cache
      const cacheRequest = {
        // ...signupRequest, // TODO ?
        otp: randomNumber,
        // emailVerified: false,
        // emailVerifyToken
      };

      await this.cacheManager.set(
        'userVerify:' + user[0].phoneNumber,
        cacheRequest,
        { ttl: 3600 },
      );

      // TODO: Move the urls to a config
      const content = {
        data: `Hello ${user[0].firstName},
        Your account has been created by admin on NTU Dashboard
        Please complete the profile by setting your password by following this link:
        ${process.env.FRONTEND_BASE_URL}/auth/set-password/${token}
        
        Also, we have sent an OTP to verify your mobile number. Go to the following link to verify:
        ${process.env.FRONTEND_BASE_URL}/auth/sms-security?phoneNumber=${user[0].phoneNumber}

        Once you complete, you will have access to the NTU app.

        The NTU Team`,
        // email: 'ntu.participant@yopmail.com',
        email: user[0].email,
        subject: 'You have been invited to the NTU',
      };
      // await sendEmailWithSES(content);
      await sendEmailWithSendgrid(content);
      return new DataResponseBuilder().createdResponse(
        user[0],
        SUCCESS_MESSAGES.user_added,
      );
    } catch (error) {
      error.message = `${error.name} - ${error.message}`;
      new ErrorResponseBuilder().throwInternalServer([error.message]);
    }
  }

  @Post('insert_one')
  @UsePipes(new JoiValidationPipe(insertOneUserSchema))
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: UserManagementResponseDto })
  @ApiOperation({
    summary: 'Insert one user record (verified + active by default)',
  })
  @ApiTags('Users')
  async insertOneUser(
    @Body() userData: InsertOneUserRequestDto,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      const user = await this.userService.insertUser(userData);
      if (!user[1]) {
        throw new BaseException('This email or phone number already exists.')
          .setName(HttpErrorMessages[HttpStatus.CONFLICT])
          .setStatusCode(HttpStatus.CONFLICT)
          .getException();
      }
      user[0].dataValues.password = undefined;

      // if (user[0].role == userRoles[2]) {
      //   await this.participantService.addParticipantToDefaultGroup(user[0].id);
      // }
      return new DataResponseBuilder().createdResponse(
        user[0],
        SUCCESS_MESSAGES.user_added,
      );
    } catch (error) {
      error.message = `${error.name} - ${error.message}`;
      new ErrorResponseBuilder().throwInternalServer([error.message]);
    }
  }

  @Delete(':id')
  @ApiOkResponse({ type: DeleteUserResponseDto })
  @ApiTags('Users')
  async deleteUserById(
    @Param('id') id: string,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      const user = await this.userService.deleteUserById(id);
      return new DataResponseBuilder().successResponse(
        user,
        SUCCESS_MESSAGES.user_deleted,
      );
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Get()
  @Roles(...userRoles)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new JoiValidationPipe(getUsersValidationSchema))
  @ApiOkResponse({ type: GetUsersResponseDto })
  @ApiTags('Users')
  async getUsers(
    @Query() data: GetUsersRequestDto,
    @GetUser('role') userRole: string,
  ): Promise<DataResponseSkeleton<UsersWithCount>> {
    try {
      const users = await this.userService.getUsers(data, userRole);
      return new DataResponseBuilder().successResponse(
        users,
        SUCCESS_MESSAGES.users_list,
      );
    } catch (error) {
      console.log(error);
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async globalSearch(@Query(new JoiValidationPipe(globalSearch)) query: any) {
    try {
      return new DataResponseBuilder().successResponse(
        await this.userService.globalSearch(query.q),
        'Results retrieved successfully',
      );
    } catch (error) {
      new ErrorResponseBuilder().buildExceptionAndThrow(error);
    }
  }

  @Get('onboarding')
  // @UseGuards(JwtAuthGuard)
  async onboardStatus(@GetUser('id') userId: string) {
    try {
      return new DataResponseBuilder().successResponse(
        await this.onboardService.findStatus(userId),
        'Status retrieved successfully',
      );
    } catch (error) {
      new ErrorResponseBuilder().buildExceptionAndThrow(error);
    }
  }

  @Post('onboarding')
  // @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(progressOnboard))
  async progressOnboard(@Query('token') token: string, @Body() data: any) {
    try {
      // let userId = null
      // if (token) {
      //   const user = await this.authenticationService.decodeToken(token)
      //   console.log(user);
      //   userId = user['id']
      // }
      return new DataResponseBuilder().successResponse(
        await this.onboardService.updateProgress(data, token),
        'Status retrieved successfully',
      );
    } catch (error) {
      new ErrorResponseBuilder().buildExceptionAndThrow(error);
    }
  }

  @Get('search/recent')
  @UseGuards(JwtAuthGuard)
  async globalSearchRecentKeywords(@GetUser('id') userId: string) {
    try {
      return new DataResponseBuilder().successResponse(
        await this.userService.getRecentSearches(userId),
        'Results retrieved successfully',
      );
    } catch (error) {
      new ErrorResponseBuilder().buildExceptionAndThrow(error);
    }
  }

  @Post('search/recent')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(createSearchEntry))
  async createRecentKeywords(@Body() data: CreateSearchEntryRequestDto, @GetUser('id') userId: string) {
    try {
      return new DataResponseBuilder().successResponse(
        await this.userService.createSearchEntry(userId, data),
        'Entry successful',
      );
    } catch (error) {
      new ErrorResponseBuilder().buildExceptionAndThrow(error);
    }
  }

  @Delete('search/recent/:id')
  @UseGuards(JwtAuthGuard)
  async removeRecentKeywords(@Param('id') id: string, @GetUser('id') userId: string) {
    try {
      return new DataResponseBuilder().successResponse(
        await this.userService.removeSearchEntry(id, userId),
        'Entry deleted successfully',
      );
    } catch (error) {
      new ErrorResponseBuilder().buildExceptionAndThrow(error);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetUserByIdResponseDto })
  @ApiTags('Users')
  async getUserById(
    @Param('id') id: string,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      const user = await this.userService.findById(id);
      user.password = undefined;
      return new DataResponseBuilder().successResponse(
        user,
        'User details retrieved successfully.',
      );
    } catch (error) {
      console.log({ error });
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(updateUserByIdSchema))
  @ApiOkResponse({ type: UpdateUserByIdResponseDto })
  @ApiTags('Users')
  async updateUserById(
    @Param('id') id: string,
    @Body() data: UpdateUserByIdRequestDto,
    @GetUser('role') userRole: string,
    @GetUser('id') userId: string,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      const user = await this.userService.updateUserById(data, id, userRole, userId);
      switch (data.status) {
        case 'active':
          return new DataResponseBuilder().successResponse(
            user,
            SUCCESS_MESSAGES.user_activated,
          );
        case 'inactive':
          return new DataResponseBuilder().successResponse(
            user,
            SUCCESS_MESSAGES.user_deactivated,
          );
        default:
          return new DataResponseBuilder().successResponse(
            user,
            SUCCESS_MESSAGES.user_updated,
          );
      }
    } catch (error) {
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }

  @Get(':id/misc')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetUserByIdResponseDto })
  @ApiTags('Users')
  async getUserMiscById(
    @Param('id') id: string,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      const user = await this.userService.getUserMiscById(id, ['miscFields']);
      return new DataResponseBuilder().successResponse(
        user,
        'User details retrieved successfully.',
      );
    } catch (error) {
      console.log({ error });
      if (error instanceof BaseException) {
        new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
      } else {
        new ErrorResponseBuilder().throwInternalServer([error.message]);
      }
    }
  }


  @Get(':id/favourites')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Users')
  async getFavourites(
    @GetUser('id') id: string
  ): Promise<DataResponseSkeleton<any>> {
    try {
      const favourites = await this.userService.getFavourites(id);
      return new DataResponseBuilder().successResponse(
        favourites,
        'User favourites retrieved successfully.',
      );
    } catch (error) {
      new ErrorResponseBuilder().buildExceptionAndThrow(error);
    }
  }

  @Get(':id/journals')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Users')
  async getJournals(
    @GetUser('id') id: string
  ): Promise<DataResponseSkeleton<any>> {
    try {
      const favourites = await this.userService.getJournals(id);
      return new DataResponseBuilder().successResponse(
        favourites,
        'User favourites retrieved successfully.',
      );
    } catch (error) {
      new ErrorResponseBuilder().buildExceptionAndThrow(error);
    }
  }
}
