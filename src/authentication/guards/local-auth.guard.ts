import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ErrorResponseBuilder } from '../../common/http/response-builders/error';
import { BaseException } from '../../common/exceptions';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(error, user, info) {
    if (info && info.message) {
      new ErrorResponseBuilder().throwBadRequest([info.message]);
    }

    if (error && error instanceof BaseException) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }

    if (!user && error instanceof BaseException) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }

    if (!user) {
      new ErrorResponseBuilder().throwUnauthorized([
        'User is not authorized to access this resource.',
      ]);
    }

    return user;
  }
}
