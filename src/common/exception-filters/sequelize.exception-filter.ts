import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

import {
  BaseError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from 'sequelize';

import { ErrorResponseBuilder } from '../http/response-builders/error';

@Catch(BaseError)
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();

    const status =
      exception instanceof BaseError
        ? HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let messages = ['Database Error'];

    if (exception instanceof UniqueConstraintError) {
      messages = exception.errors.map(error => error.message);
    }

    if (exception instanceof ForeignKeyConstraintError) {
      messages = [exception.message];
    }

    response
      .status(status)
      .json(new ErrorResponseBuilder().internalServer(messages));
  }
}
