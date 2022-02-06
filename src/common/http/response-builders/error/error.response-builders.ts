import {
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

import { HttpErrorMessages } from '../../../constants/http.constants';
import { BaseException, DatabaseException } from '../../../exceptions';

export class ErrorResponseBuilder {
  // private errorResponseStructure: {
  //   statusCode: number,
  //   message: Array<string>,
  //   error: string;
  // }

  private statusCode: number;
  private message: Array<string>;
  private error: string;

  getStatusCode() {
    return this.statusCode;
  }

  setStatusCode(statusCode: number) {
    this.statusCode = statusCode;
  }

  getMessage() {
    return this.message;
  }

  setMessage(message: Array<string>) {
    this.message = message;
  }

  getError() {
    return this.error;
  }

  setError(error: string) {
    this.error = error;
  }

  errorResponseSkeleton() {
    return {
      statusCode: this.getStatusCode(),
      message: this.getMessage(),
      error: this.getError(),
    };
  }

  buildWithBaseException(error: BaseException): ErrorResponseBuilder {
    this.setStatusCode(error.getStatusCode());
    this.setMessage([error.getMessage()]);
    this.setError(error.getName());
    return this;
  }

  buildAndThrowWithBaseException(error: BaseException): ErrorResponseBuilder {
    this.setStatusCode((error.getStatusCode && error.getStatusCode()) || 500);
    this.setMessage([
      (error.getMessage && error.getMessage()) || 'Something went wrong.',
    ]);
    this.setError(
      (error.getName && error.getName()) ||
        HttpErrorMessages[HttpStatus.INTERNAL_SERVER_ERROR],
    );

    throw new HttpException(this.errorResponseSkeleton(), this.getStatusCode());
  }

  buildExceptionAndThrow(error: Error) {
    //  if it is a Database exception then throw usign DatabaseException;
    DatabaseException.checkDbExceptionAndThrow(error);

    //  If error is of type BaseException then thorw
    if (error instanceof BaseException) {
      this.buildAndThrowWithBaseException(error);
    }

    //  otherwise just throw the regular way;
    this.throwInternalServer([error.message]);
  }

  badRequest(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.BAD_REQUEST);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.BAD_REQUEST]);

    // return ({
    //   statusCode: this.getStatusCode(),
    //   message: this.getMessage(),
    //   error: this.getError(),
    // });
    return this.errorResponseSkeleton();
  }

  throwBadRequest(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.BAD_REQUEST);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.BAD_REQUEST]);

    // throw new BadRequestException({
    //   statusCode: this.getStatusCode(),
    //   message: this.getMessage(),
    //   error: this.getError(),
    // });
    throw new BadRequestException(this.errorResponseSkeleton());
  }

  throwNotFound(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.NOT_FOUND);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.NOT_FOUND]);

    throw new NotFoundException(this.errorResponseSkeleton());
  }

  // 5XX Errors;
  internalServer(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.INTERNAL_SERVER_ERROR]);

    return this.errorResponseSkeleton();
  }

  throwInternalServer(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.INTERNAL_SERVER_ERROR]);

    throw new InternalServerErrorException(this.errorResponseSkeleton());
  }

  conflict(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.CONFLICT);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.CONFLICT]);

    return this.errorResponseSkeleton();
    // throw new NotFoundException(this.errorResponseSkeleton());
  }

  throwConflict(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.CONFLICT);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.CONFLICT]);

    throw new ConflictException(this.errorResponseSkeleton());
  }

  unauthorized(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.UNAUTHORIZED);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.UNAUTHORIZED]);

    return this.errorResponseSkeleton();
  }

  throwUnauthorized(message: Array<string>, error?: string) {
    this.setStatusCode(HttpStatus.UNAUTHORIZED);
    this.setMessage(message);
    this.setError(error || HttpErrorMessages[HttpStatus.UNAUTHORIZED]);

    throw new UnauthorizedException(this.errorResponseSkeleton());
  }
}
