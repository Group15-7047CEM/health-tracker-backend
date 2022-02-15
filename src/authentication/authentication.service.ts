import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { auth } from 'firebase-admin';
import { Sequelize as SequelizeTS } from 'sequelize-typescript';
import {
  UpdateUserByIdRequestDto, UserManagementRequestDto
} from '.././user-management/dto';
import { HttpErrorMessages } from '../common/constants';
import { BaseException } from '../common/exceptions';
import { ERROR_MESSAGES } from '../common/response-messages';
import {
  checkPassword, hashPassword, isOldPassword, isPasswordValid, sendEmailWithSendgrid, sendTwilioSMS
} from '../common/utils';
import {
  deviceTokenTypes, userRoles, userStatuses
} from '../user-management/enums';
import { UserDeviceTokenModel, UserModel } from '../user-management/models';
import { UserManagementService } from '../user-management/user-management.service';
import { UserCache } from './classes';
import {
  ChangePasswordRequestDto,
  ForgotPasswordRequestDto,
  ForgotPasswordVerifyRequestDto,
  OtpRequestDto,
  ResendOtpRequestDto, SignupRequestDto, VerifyEmailRequestDto
} from './dto';


@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userService: UserManagementService,
    private readonly jwtService: JwtService,
    private readonly sequelize: SequelizeTS,
  ) {}

  // @Cron('5 0 * * *') // Every day at 00:05:00
  checkPasswordsExpiry() {
    try {
      console.log('Checking expired passwords(every day at 00:05:00)...');
      this.sendNotificationsForExpiredPasswords();
    } catch (error) {
      console.log('ERROR (checkPasswordsExpiry): ', error);
    }
  }

  async decodeToken(token: string) {
    return await this.jwtService.verify(token).split('#')
  }

  async signup(signupRequest: SignupRequestDto): Promise<UserCache> {
    // check for existing user with email and phone number in db
    const user = await this.userService.findExistingUser(
      signupRequest.email,
      // signupRequest.phoneNumber,
    );

    if (user) {
      throw new BaseException(ERROR_MESSAGES.user_already_exist)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }
    await checkPassword(signupRequest.password, signupRequest);

    // const randomNumber = Math.floor(100000 + Math.random() * 900000);
    // TODO: Static OTP
    // const randomNumber = 654321;
    // send otp to registered number if no user found in db with the details
    // await this.sendOtp(signupRequest.phoneNumber, randomNumber);

    const emailVerifyToken = this.jwtService.sign(
      signupRequest.email + '#' + signupRequest.email,
    );
    // set the user details in cache
    delete signupRequest['status'];

    signupRequest.role = 'participant'
    // const cacheRequest = {
    //   ...signupRequest,
    //   otp: null,
    //   emailVerified: false,
    //   emailVerifyToken,
    // };

    // await this.cacheManager.set(
    //   'userVerify:' + emailVerifyToken,
    //   cacheRequest,
    //   { ttl: 3600 },
    // );

    const createdUser = await this.userService.createUser(
      signupRequest as UserManagementRequestDto,
    );

    const content = {
      data: `Hi ${signupRequest.firstName},
      To verify your email please click on the following link:
      ${process.env.FRONTEND_BASE_URL}/auth/verify-email?token=${emailVerifyToken}&&email=${signupRequest.email}`,
      // email: 'ntu.participant@yopmail.com',
      email: signupRequest.email,
      subject: 'Email Verification',
    };
    // await sendEmailWithSES(content);
    // await sendEmailWithSendgrid(content); // TODO: Use this
    // const token = this.jwtService.sign(
    //   createdUser.id + '#' + createdUser.email,
    // );
    // createdUser['token'] = token
    return createdUser;
  }

  private async addFCMToken(userId: string, fcmToken: string) {
    const exists = await UserDeviceTokenModel.findOne({
      where: {
        deviceToken: fcmToken,
        tokenType: deviceTokenTypes[0],
      },
    });
    if (exists) {
      return;
    }
    const addedTokens = await UserDeviceTokenModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    return await this.sequelize.transaction(async t => {
      const dbOptions = { transaction: t };
      if (addedTokens.length >= 5) {
        const tokensToRemove = addedTokens.slice(5).map(t => t.deviceToken);
        await UserDeviceTokenModel.destroy({
          where: {
            deviceToken: tokensToRemove,
          },
          ...dbOptions,
        });
      }
      return UserDeviceTokenModel.create(
        {
          deviceToken: fcmToken,
          tokenType: deviceTokenTypes[0],
          userId,
        },
        dbOptions,
      );
    });
  }

  // TODO: Add in logout API
  private async removeFCMToken(userId: string, fcmToken: string) {
    return UserDeviceTokenModel.destroy({
      where: {
        deviceToken: fcmToken,
        tokenType: deviceTokenTypes[0],
        userId,
      },
    });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserModel> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BaseException(ERROR_MESSAGES.invalid_credential)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }

    if (!user.password) {
      throw new BaseException(ERROR_MESSAGES.invalid_credential)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }

    if (
      !isPasswordValid(
        password,
        user.password.split('$')[1],
        user.password.split('$')[1] as crypto.HashOptions,
      )
    ) {
      throw new BaseException(ERROR_MESSAGES.invalid_credential)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }

    user.password = undefined;
    return user;
  }

  async login(
    email: string,
    password: string,
    fcmToken?: string,
  ): Promise<any> {
    const user = await this.validateUser(email, password);
    let participantId, isOnboarded, isConsentSigned;
    if (!user) {
      throw new BaseException(ERROR_MESSAGES.invalid_credential)
        .setName(HttpErrorMessages[HttpStatus.UNAUTHORIZED])
        .setStatusCode(HttpStatus.UNAUTHORIZED)
        .getException();
    }

    /*
    if (user.role === userRoles[5]) {
      console.log("HERE 2");
      throw new BaseException(ERROR_MESSAGES.invalid_credential)
        .setName(HttpErrorMessages[HttpStatus.FORBIDDEN])
        .setStatusCode(HttpStatus.FORBIDDEN)
        .getException();
    }
    */
    // console.log("HERE 3")
    // if (!user.mobileVerified) {
    //   throw new BaseException(ERROR_MESSAGES.user_not_verified)
    //     .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
    //     .setStatusCode(HttpStatus.BAD_REQUEST)
    //     .getException();
    // }

    // if (!user.emailVerified) {
    //   throw new BaseException(ERROR_MESSAGES.user_email_not_verified)
    //     .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
    //     .setStatusCode(HttpStatus.BAD_REQUEST)
    //     .getException();
    // }

    // TODO: Keep 'active' always
    // if (user.status === 'inactive') {
    //   throw new BaseException(ERROR_MESSAGES.deactivated_user)
    //     .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
    //     .setStatusCode(HttpStatus.BAD_REQUEST)
    //     .getException();
    // }

    // if (user.role == userRoles[2]) {
    //   // const participant = await this.participantService.getParticipantByUserId(
    //     user.id,
    //   );
    //   participantId = participant ? participant.id : null;
    //   isOnboarded = participant ? participant.isOnboarded : null;
    //   isConsentSigned = participant ? participant.isConsentSigned : null;
    // }

    // TODO: Uncomment after FE integrates logout
    // if (user.isLoggedIn) {
    //   throw new BaseException(ERROR_MESSAGES.user_already_loggedin)
    //   .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
    //   .setStatusCode(HttpStatus.BAD_REQUEST).getException();
    // }

    // if (fcmToken) {
    //   try {
    //     await this.addFCMToken(user.id, fcmToken);
    //   } catch (error) {
    //     console.log('[ERROR] Add FCM Token: ', error);
    //   }
    // }
    await UserModel.update(
      { isLoggedIn: true },
      {
        where: {
          id: user.id,
        },
      },
    );
    // Create and inject FIRESTORE DB AUTH TOKEN
    // const firestoreDBToken = await auth().createCustomToken(user.id);
    return {
      id: user.id,
      participantId,
      // isOnboarded,
      // isConsentSigned,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      // phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      profileImage: user.profileImage,
      // dbToken: firestoreDBToken,
      token: this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          participantId,
          status: user.status,
          role: user.role,
        },
        { expiresIn: "1d" }
      ),
    };
  }

  async mobileLogin(
    email: string,
    password: string,
    fcmToken?: string,
  ): Promise<any> {
    const user = await this.validateUser(email, password);
    let participantId, isOnboarded, isConsentSigned;
    if (!user) {
      throw new BaseException(ERROR_MESSAGES.invalid_credential)
        .setName(HttpErrorMessages[HttpStatus.UNAUTHORIZED])
        .setStatusCode(HttpStatus.UNAUTHORIZED)
        .getException();
    }

    if (user.role !== userRoles[5]) {
      throw new BaseException(ERROR_MESSAGES.invalid_credential)
        .setName(HttpErrorMessages[HttpStatus.FORBIDDEN])
        .setStatusCode(HttpStatus.FORBIDDEN)
        .getException();
    }

    if (!user.mobileVerified) {
      throw new BaseException(ERROR_MESSAGES.user_not_verified)
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

    if (user.status === 'inactive') {
      throw new BaseException(ERROR_MESSAGES.deactivated_user)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }

    // if (user.role == userRoles[2]) {
    //   // const participant = await this.participantService.getParticipantByUserId(
    //     user.id,
    //   );
    //   participantId = participant ? participant.id : null;
    //   isOnboarded = participant ? participant.isOnboarded : null;
    //   isConsentSigned = participant ? participant.isConsentSigned : null;
    // }

    // TODO: Uncomment after FE integrates logout
    // if (user.isLoggedIn) {
    //   throw new BaseException(ERROR_MESSAGES.user_already_loggedin)
    //   .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
    //   .setStatusCode(HttpStatus.BAD_REQUEST).getException();
    // }

    if (fcmToken) {
      try {
        await this.addFCMToken(user.id, fcmToken);
      } catch (error) {
        console.log('[ERROR] Add FCM Token: ', error);
      }
    }
    await UserModel.update(
      { isLoggedIn: true },
      {
        where: {
          id: user.id,
        },
      },
    );
    // Create and inject FIRESTORE DB AUTH TOKEN
    const firestoreDBToken = await auth().createCustomToken(user.id);
    return {
      id: user.id,
      participantId,
      isOnboarded,
      isConsentSigned,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      profileImage: user.profileImage,
      dbToken: firestoreDBToken,
      token: this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          participantId,
          status: user.status,
          role: user.role,
        },
        // { expiresIn: "1d" }
      ),
    };
  }

  async logout(userId: string, data: any, jwt: string) {
    const { fcmToken } = data;
    if (fcmToken) {
      await this.removeFCMToken(userId, fcmToken);
    }
    // Add jwt to block list in cache
    if (jwt) {
      await this.cacheManager.set('blockjwt:' + jwt.split('.')[2], 'blocked', {
        ttl: 259200,
      });
    }

    // Mark as logged out
    await UserModel.update(
      { isLoggedIn: false },
      {
        where: {
          id: userId,
        },
      },
    );
    return {};
  }

  async changePassword(
    reqData: ChangePasswordRequestDto,
    id: string,
  ): Promise<UserModel> {
    const user = await this.userService.findById(id);

    if (user?.status == 'inactive') {
      throw new BaseException(ERROR_MESSAGES.deactivated_user)
        .setName(HttpErrorMessages[HttpStatus.UNAUTHORIZED])
        .setStatusCode(HttpStatus.UNAUTHORIZED)
        .getException();
    }

    if (isOldPassword(reqData.newPassword, user.passwords)) {
      throw new BaseException(ERROR_MESSAGES.using_old_password)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }
    delete user.passwords;
    if (!user) {
      throw new BaseException(ERROR_MESSAGES.user_not_found)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }
    if (
      !isPasswordValid(
        reqData.currentPassword,
        user.password.split('$')[1],
        user.password.split('$')[1] as crypto.HashOptions,
      )
    ) {
      throw new BaseException(ERROR_MESSAGES.password_mismatch)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }
    if (reqData.currentPassword === reqData.newPassword) {
      throw new BaseException(ERROR_MESSAGES.same_password)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }
    await checkPassword(reqData.newPassword, user);
    const updatedPassword = hashPassword(reqData.newPassword);
    user.password = updatedPassword;

    const result = await this.userService.updatePasswordById(
      updatedPassword,
      id,
    );

    if (!result) {
      throw new BaseException(ERROR_MESSAGES.password_update_failed)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }

    const content = {
      data: `Hi ${user.firstName},
      In an effort to ensure the security of your profile, we are
      alerting you that your password has been reset.`,
      // email: 'ntu.participant@yopmail.com',
      email: user.email,
      subject: 'Password updated',
    };
    // await sendEmailWithSES(content);
    await sendEmailWithSendgrid(content); // TODO: Use this
    return result;
  }

  async forgotPassword(reqData: ForgotPasswordRequestDto): Promise<UserModel> {
    const id = this.jwtService.verify(reqData.token);
    const user = await this.userService.findById(id);

    if (user?.status == 'inactive') {
      throw new BaseException(ERROR_MESSAGES.deactivated_user)
        .setName(HttpErrorMessages[HttpStatus.UNAUTHORIZED])
        .setStatusCode(HttpStatus.UNAUTHORIZED)
        .getException();
    }

    if (isOldPassword(reqData.password, user.passwords)) {
      throw new BaseException(ERROR_MESSAGES.using_old_password)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }
    delete user.passwords;

    if (!user) {
      throw new BaseException(ERROR_MESSAGES.user_not_found)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }

    await checkPassword(reqData.password, user);
    const updatedPassword = hashPassword(reqData.password);
    user.password = updatedPassword;

    const result = await this.userService.updatePasswordById(
      updatedPassword,
      id,
    );

    if (!result) {
      throw new BaseException(ERROR_MESSAGES.password_update_failed)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }
    const content = {
      data: `Hi ${user.firstName},
      In an effort to ensure the security of your profile, we are
      alerting you that your password has been reset.`,
      // email: 'ntu.participant@yopmail.com',
      email: user.email,
      subject: 'Password updated',
    };
    // await sendEmailWithSES(content);
    await sendEmailWithSendgrid(content);
    return result;
  }

  async forgotPasswordVerify(
    reqData: ForgotPasswordVerifyRequestDto,
  ): Promise<UserModel> {
    const user = await this.userService.findByEmail(reqData.email);

    if (!user) {
      // throw new BaseException(ERROR_MESSAGES.invalid_email)
      // .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
      // .setStatusCode(HttpStatus.NOT_FOUND).getException();
      throw new BaseException('Invalid Username or Password.')
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }
    const token = this.jwtService.sign(user.id);

    const content = {
      data: `Hi ${user.firstName},
      We have just received a request for you to reset your password.
      To reset your password please click on the following link:
      ${process.env.FRONTEND_BASE_URL}/auth/reset-password/${token}`,
      // email: 'ntu.participant@yopmail.com',
      email: user.email,
      subject: 'Forgot Password',
    };

    // await sendEmailWithSES(content);
    await sendEmailWithSendgrid(content);
    return null;
  }

  async sendOtp(phoneNumber: string): Promise<any> {
    // const randomNumber = Math.floor(100000 + Math.random() * 900000);
    // TODO: Static OTP
    const randomNumber = 654321;
    // send otp to registered number if no user found in db with the details
    const cacheRequest = {
      otp: randomNumber
    };

    await this.cacheManager.set(
      'userVerify:' + phoneNumber,
      cacheRequest,
      { ttl: 3600 },
    );
    // return await sendTwilioSMS({
    //   phoneNumber,
    //   randomNumber,
    // });
    // return await sendSMSWithSNS(phoneNumber, `${otp}`);
  }

  async resendOtp(otpRequest: ResendOtpRequestDto): Promise<any> {
    // Check if user exists in DB + if mobile verified
    const user = await this.userService.findByPhoneNumber(
      otpRequest.phoneNumber,
    );
    if (user && user.mobileVerified) {
      throw new BaseException(ERROR_MESSAGES.user_already_verified)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    // TODO: Static OTP
    // const randomNumber = 654321;
    const userCache = await this.cacheManager.get(
      'userVerify:' + otpRequest.phoneNumber,
    );

    if (!user && !userCache) {
      throw new BaseException(ERROR_MESSAGES.user_not_found)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }

    if (userCache) {
      userCache.otp = randomNumber;
      await this.cacheManager.set(
        'userVerify:' + otpRequest.phoneNumber,
        userCache,
        { ttl: 3600 },
      );
      // await sendSMSWithSNS(otpRequest.phoneNumber, `${randomNumber}`);
      await sendTwilioSMS({
        phoneNumber: otpRequest.phoneNumber,
        otp: randomNumber,
      });
      return null;
    }

    // send otp to registered number if no user found in db with the details
    await sendTwilioSMS({
      phoneNumber: otpRequest.phoneNumber,
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
      'userVerify:' + user.phoneNumber,
      cacheRequest,
      { ttl: 3600 },
    );
    return null;
  }

  // Mark as Active if email/mobile is verified
  private async markAsActiveForVerified(userId) {
    const user = await UserModel.findOne({
      where: {
        id: userId,
      },
    });
    if (user.emailVerified && user.mobileVerified) {
      user.status = userStatuses[0];
    }
    return user.save();
  }

  async verifySignUpOtp(otpRequest: OtpRequestDto, userId?: string): Promise<UserModel> {
    const { phoneNumber, otp } = otpRequest;

    const user = await this.userService.findByPhoneNumber(phoneNumber);
    if (user && user.mobileVerified) {
      throw new BaseException(ERROR_MESSAGES.user_already_verified)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }

    const userCache = await this.cacheManager.get('userVerify:' + phoneNumber);
    if (!userCache) {
      throw new BaseException(ERROR_MESSAGES.otp_expired)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }

    // TODO: Once Twilio paid mode is active, remove the 654321 check
    if (Number(otp) !== Number(userCache.otp) && Number(otp) !== 654321) {
      throw new BaseException(ERROR_MESSAGES.invalid_otp)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }

    userCache.mobileVerified = true;
    let newUser;
    
    const findExistingUser = await this.userService.findById(userId)
    // Delete user cache once user is created
    await this.cacheManager.del('userVerify:' + phoneNumber);
    // eslint-disable-next-line prefer-const
    newUser = findExistingUser;
    newUser.mobileVerified = true;
    await newUser.save();

    this.markAsActiveForVerified(newUser.id);

    // if (newUser.role === userRoles[2]) {
    //   await this.participantService.addParticipantToDefaultGroup(newUser.id);
    // }

    const content = {
      data: `Hi ${newUser.firstName},
      Thank you for your profile submission.
      Your mobile number has been verified successfully`,
      // email: 'ntu.participant@yopmail.com',
      email: newUser.email,
      subject: 'OTP Verification',
    };
    // await sendEmailWithSES(content);
    await sendEmailWithSendgrid(content);
    newUser.password = undefined;

    return newUser;
  }

  async verifyEmail(
    verifyEmailRequest: VerifyEmailRequestDto,
  ): Promise<UserModel> {
    const { email, emailVerifyToken } = verifyEmailRequest;
    const hashedData = this.jwtService.verify(emailVerifyToken).split('#');

    const user = await this.userService.findByEmail(email);

    if (user && user.emailVerified) {
      this.markAsActiveForVerified(user.id);
      throw new BaseException(ERROR_MESSAGES.user_already_verified)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }

    // verify email for the user created in db.
    if (user && !user.emailVerified) {
      if (user.emailVerifyToken === emailVerifyToken && user.email === email) {
        const toBeUpdated = {
          emailVerified: true,
          emailVerifyToken: null,
        };

        const updatedObj = await this.userService.updateUserById(
          toBeUpdated as UpdateUserByIdRequestDto,
          user.id,
        );
        if (!updatedObj) {
          throw new BaseException(ERROR_MESSAGES.user_not_updated)
            .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
            .setStatusCode(HttpStatus.BAD_REQUEST)
            .getException();
        }
        this.markAsActiveForVerified(user.id);
        return updatedObj;
      } else {
        throw new BaseException(ERROR_MESSAGES.invalid_token).setName(
          HttpErrorMessages[HttpStatus.BAD_REQUEST],
        );
      }
    }

    const userCache = await this.cacheManager.get(
      'userVerify:' + hashedData[1],
    );
    if (!userCache) {
      throw new BaseException(ERROR_MESSAGES.user_not_found)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }

    // verify email for the user in cache.
    if (emailVerifyToken !== userCache.emailVerifyToken) {
      throw new BaseException(ERROR_MESSAGES.invalid_token)
        .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
        .setStatusCode(HttpStatus.BAD_REQUEST)
        .getException();
    }

    userCache.emailVerified = true;
    userCache.emailVerifyToken = null;
    delete userCache.status;

    await this.cacheManager.set('userVerify:' + hashedData[1], userCache, {
      ttl: 3600,
    });
    userCache.otp = undefined;
    userCache.password = undefined;
    return userCache;
  }

  // Only for Create User flow from Admin Web
  async setPassword(reqData: ForgotPasswordRequestDto): Promise<UserModel> {
    const id = this.jwtService.verify(reqData.token);
    const user = await this.userService.findById(id);
    await checkPassword(reqData.password, user);

    if (!user) {
      throw new BaseException(ERROR_MESSAGES.user_not_found)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }

    const updatedPassword = hashPassword(reqData.password);
    user.password = updatedPassword;

    const result = await this.userService.updatePasswordById(
      updatedPassword,
      id,
    );

    if (!result) {
      throw new BaseException(ERROR_MESSAGES.password_update_failed)
        .setName(HttpErrorMessages[HttpStatus.NOT_FOUND])
        .setStatusCode(HttpStatus.NOT_FOUND)
        .getException();
    }
    // Mark email as verified
    await UserModel.update(
      { emailVerified: true },
      {
        where: {
          id: user.id,
        },
      },
    );
    const content = {
      data: `Hi ${user.firstName},
      In an effort to ensure the security of your profile, we are
      alerting you that your password has been set.`,
      // email: 'ntu.participant@yopmail.com',
      email: user.email,
      subject: 'Password updated',
    };
    // await sendEmailWithSES(content);
    await sendEmailWithSendgrid(content);
    this.markAsActiveForVerified(user.id);
    return result;
  }

  async sendNotificationsForExpiredPasswords() {
    const currentDatetime = new Date();
    const year = currentDatetime.getFullYear();
    let month = `${currentDatetime.getMonth() + 1}`;
    month = month.length === 1 ? '0' + month : month;
    let day = `${currentDatetime.getDate()}`;
    day = day.length === 1 ? '0' + day : day;
    const currentDate = year + '-' + month + '-' + day;

    const users = await this.userService.getUsersWithExpiredPasswords(
      currentDate,
    );
    const userIds = users.map(user => user.id);
    // await this.notificationService.sendAllNotifications(
    //   userIds,
    //   'password_expired_reminder',
    // );
  }
}
