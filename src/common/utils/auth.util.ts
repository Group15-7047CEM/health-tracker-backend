import * as crypto from 'crypto';
import { verify } from 'jsonwebtoken';
import { UserModel, UserPasswordsModel } from 'src/user-management/models';
import { BaseException } from '../exceptions';
import { ERROR_MESSAGES } from '../response-messages';
import { HttpErrorMessages } from '../constants';
import { HttpStatus } from '@nestjs/common';

export async function verifyJwtToken(token: string): Promise<any> {
  return await verify(token, process.env.JWT_SECRET);
}

export function isPasswordValid(
  password: string,
  hashFromDb: string,
  saltFromDb: crypto.HashOptions,
): boolean {
  const hash = crypto
    .createHash('sha512', saltFromDb)
    .update(password)
    .digest('base64');

  return hash === hashFromDb;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('base64') as crypto.HashOptions;

  const hash = crypto
    .createHash('sha512', salt)
    .update(password)
    .digest('base64');
  return salt + '$' + hash;
}

export function checkPassword(password: string, user: any): any {
  if (user.id === password) {
    throw new BaseException(ERROR_MESSAGES.user_id_as_password)
      .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
      .setStatusCode(HttpStatus.BAD_REQUEST)
      .getException();
  }

  if (user.email === password) {
    throw new BaseException(ERROR_MESSAGES.email_as_password)
      .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
      .setStatusCode(HttpStatus.BAD_REQUEST)
      .getException();
  }

  if (user.phoneNumber === password) {
    throw new BaseException(ERROR_MESSAGES.phone_number_as_password)
      .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
      .setStatusCode(HttpStatus.BAD_REQUEST)
      .getException();
  }

  if (user.firstName.includes(password) || user.lastName.includes(password)) {
    throw new BaseException(ERROR_MESSAGES.user_name_as_password)
      .setName(HttpErrorMessages[HttpStatus.BAD_REQUEST])
      .setStatusCode(HttpStatus.BAD_REQUEST)
      .getException();
  }
}

export function isOldPassword(
  newPassword: string,
  oldPasswords: UserPasswordsModel[],
): boolean {
  let isOldPassword = false;
  if (oldPasswords.length) {
    oldPasswords.forEach(element => {
      if (
        isPasswordValid(
          newPassword,
          element.password.split('$')[1],
          element.password.split('$')[1] as crypto.HashOptions,
        )
      ) {
        isOldPassword = true;
      }
    });
  }
  return isOldPassword;
}
