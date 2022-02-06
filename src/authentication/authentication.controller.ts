import {
  Body, Controller, HttpCode,
  HttpStatus, Post,
  Put, UseGuards, UsePipes
} from '@nestjs/common';
import {
  ApiBody, ApiCreatedResponse,
  ApiOkResponse, ApiOperation, ApiTags
} from '@nestjs/swagger';
import { GetUser } from '../common/decorators';
import {
  DataResponseBuilder,
  DataResponseSkeleton
} from '../common/http/response-builders/data';
import { ErrorResponseBuilder } from '../common/http/response-builders/error';
import { JoiValidationPipe } from '../common/pipes';
import { SUCCESS_MESSAGES } from '../common/response-messages';
// import * as admin from 'firebase-admin';
import { userStatuses } from '../user-management/enums';
import { User } from './../user-management/classes';
import { AuthenticationService } from './authentication.service';
import { Authentication, UserCache } from './classes';
import {
  ChangePasswordRequestDto,
  ChangePasswordResponseDto, ForgotPasswordRequestDto, ForgotPasswordResponseDto, ForgotPasswordVerifyRequestDto, ForgotPasswordVerifyResponseDto, LoginRequestDto,
  LoginResponseDto, LogoutRequestDto,
  LogoutResponseDto, OtpRequestDto, OtpResponseDto, ResendOtpRequestDto, ResendOtpResponseDto, SetPasswordRequestDto, SetPasswordResponseDto, SignupRequestDto,
  SignupResponseDto, VerifyEmailRequestDto
} from './dto';
import { JwtAuthGuard } from './guards';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  forgotPasswordVerifySchema, loginSchema, logoutSchema,
  mobileLoginSchema, otpVerifySchema,
  resendOtpSchema,
  setPasswordSchema, signUpSchema, verifyEmailSchema
} from './schemas';


@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signup')
  @UsePipes(new JoiValidationPipe(signUpSchema))
  @ApiCreatedResponse({ type: SignupResponseDto })
  @ApiTags('Authentication')
  async signup(
    @Body() signupRequest: SignupRequestDto,
  ): Promise<DataResponseSkeleton<Authentication>> {
    try {
      return new DataResponseBuilder().createdResponse(
        await this.authService.signup(signupRequest),
        SUCCESS_MESSAGES.user_registered,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(LocalAuthGuard)
  @UsePipes(new JoiValidationPipe(loginSchema))
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiTags('Authentication')
  @ApiBody({ type: LoginRequestDto })
  async login(
    @Body() data: LoginRequestDto,
  ): Promise<DataResponseSkeleton<Authentication>> {
    try {
      const { email, password, fcmToken } = data;
      const user = await this.authService.login(
        email,
        password,
        fcmToken,
      );
      return new DataResponseBuilder().successResponse(
        user,
        SUCCESS_MESSAGES.user_logged_in,
      );
    } catch (error) {
      console.log(error);
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Post('login/mobile')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(LocalAuthGuard)
  @UsePipes(new JoiValidationPipe(mobileLoginSchema))
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiTags('Authentication')
  @ApiBody({ type: LoginRequestDto })
  async mobileLogin(
    @Body() data: LoginRequestDto,
  ): Promise<DataResponseSkeleton<Authentication>> {
    try {
      const { email, password, fcmToken } = data;
      const user = await this.authService.mobileLogin(
        email,
        password,
        fcmToken,
      );
      return new DataResponseBuilder().successResponse(
        user,
        SUCCESS_MESSAGES.user_logged_in,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(logoutSchema))
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiOperation({
    summary: 'On Logout - 1. Expires fcm token, 2. Marks isLoggedIn as false',
  })
  @ApiTags('Authentication')
  @ApiBody({ type: LogoutRequestDto })
  async logout(
    @Body() data: LogoutRequestDto,
    @GetUser('id') userId: string,
    @GetUser('jwt') jwt: string,
  ): Promise<DataResponseSkeleton<Authentication>> {
    try {
      const user = await this.authService.logout(userId, data, jwt);
      return new DataResponseBuilder().successResponse(
        user,
        SUCCESS_MESSAGES.user_logged_out,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Put('change_password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new JoiValidationPipe(changePasswordSchema))
  @ApiOkResponse({ type: ChangePasswordResponseDto })
  @ApiTags('Authentication')
  async changePassword(
    @Body() data: ChangePasswordRequestDto,
    @GetUser('id') userId: string,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      const changedPassword = await this.authService.changePassword(
        data,
        userId,
      );
      return new DataResponseBuilder().successResponse(
        changedPassword,
        SUCCESS_MESSAGES.password_updated,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Put('forgot_password/reset')
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema))
  @ApiOkResponse({ type: ForgotPasswordResponseDto })
  @ApiTags('Authentication')
  async forgotPassword(
    @Body() data: ForgotPasswordRequestDto,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      return new DataResponseBuilder().successResponse(
        await this.authService.forgotPassword(data),
        SUCCESS_MESSAGES.password_updated,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Post('forgot_password')
  @UsePipes(new JoiValidationPipe(forgotPasswordVerifySchema))
  @ApiOkResponse({ type: ForgotPasswordVerifyResponseDto })
  @ApiTags('Authentication')
  async forgotPasswordVerify(
    @Body() data: ForgotPasswordVerifyRequestDto,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      return new DataResponseBuilder().successResponse(
        await this.authService.forgotPasswordVerify(data),
        `An Email sent to your ${data.email}, kindly check your email`,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Put('set_password')
  @UsePipes(new JoiValidationPipe(setPasswordSchema))
  @ApiOkResponse({ type: SetPasswordResponseDto })
  @ApiTags('Authentication')
  async setPassword(
    @Body() data: SetPasswordRequestDto,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      return new DataResponseBuilder().successResponse(
        await this.authService.setPassword(data),
        SUCCESS_MESSAGES.password_updated,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Post('signup/resend_otp')
  @UsePipes(new JoiValidationPipe(resendOtpSchema))
  @ApiCreatedResponse({ type: ResendOtpResponseDto })
  @ApiTags('Authentication')
  async resendOtp(
    @Body() data: ResendOtpRequestDto,
  ): Promise<DataResponseSkeleton<UserCache>> {
    try {
      return new DataResponseBuilder().successResponse(
        await this.authService.resendOtp(data),
        SUCCESS_MESSAGES.otp_sent,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Post('signup/verify_otp')
  @UsePipes(new JoiValidationPipe(otpVerifySchema))
  @ApiCreatedResponse({ type: OtpResponseDto })
  @ApiTags('Authentication')
  async verifySignUpOtp(
    @Body() OtpRequest: OtpRequestDto,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      const user = await this.authService.verifySignUpOtp(OtpRequest);
      let responseMessage;
      if (userStatuses.includes(user.role)) {
        responseMessage = SUCCESS_MESSAGES.account_approval_pending;
      } else {
        responseMessage = SUCCESS_MESSAGES.otp_verified;
      }
      return new DataResponseBuilder().successResponse(user, responseMessage);
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }

  @Post('verify_email')
  @UsePipes(new JoiValidationPipe(verifyEmailSchema))
  @ApiCreatedResponse({ type: VerifyEmailRequestDto })
  @ApiTags('Authentication')
  async verifyEmail(
    @Body() verifyEmailRequest: VerifyEmailRequestDto,
  ): Promise<DataResponseSkeleton<User>> {
    try {
      const user = await this.authService.verifyEmail(verifyEmailRequest);
      return new DataResponseBuilder().successResponse(
        user,
        SUCCESS_MESSAGES.email_verified,
      );
    } catch (error) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }
  }
}
