import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BaseException } from '../../common/exceptions';
import { ErrorResponseBuilder } from '../../common/http/response-builders/error';
import { ERROR_MESSAGES } from '../../common/response-messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(error, user, info) {
    if (error && error instanceof BaseException) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }

    if (!user && error instanceof BaseException) {
      new ErrorResponseBuilder().buildAndThrowWithBaseException(error);
    }

    if (!user) {
      new ErrorResponseBuilder().throwUnauthorized([
        ERROR_MESSAGES.unauthorized_user,
      ]);
    }

    if (user?.status == 'inactive') {
      new ErrorResponseBuilder().throwUnauthorized([
        ERROR_MESSAGES.deactivated_user,
      ]);
    }

    return user;
  }
}
