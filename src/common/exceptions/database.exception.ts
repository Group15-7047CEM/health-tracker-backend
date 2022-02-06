import {
  BaseError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  SequelizeScopeError,
  ValidationError,
} from 'sequelize';

import { ErrorResponseBuilder } from '../http/response-builders/error';

export class DatabaseException {
  static checkDbExceptionAndThrow(error) {
    if (error instanceof BaseError) {
      this.buildAndThrowException(error);
    }
    return;
  }

  static buildAndThrowException<T extends BaseError>(error: T) {
    let messages = ['Database Error'];

    if (error instanceof UniqueConstraintError) {
      messages = error.errors.map(error => error.message);
    }
    if (error instanceof ForeignKeyConstraintError) {
      messages = [error.message];
    }
    if (error instanceof SequelizeScopeError) {
      messages = [error.message];
    }
    if (error instanceof ValidationError) {
      messages = error.errors.map(error => error.message);
    } else {
      messages = [error.message];
    }

    new ErrorResponseBuilder().throwInternalServer(messages);
  }
}
