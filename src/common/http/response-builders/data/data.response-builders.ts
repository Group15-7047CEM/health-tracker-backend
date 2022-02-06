import { HttpStatus } from '@nestjs/common';

export class DataResponseBuilder {
  // private dataResponseStructure: {
  //   statusCode: number,
  //   data: any,
  // }

  private statusCode: number;
  private data: any;
  private message: any;

  getStatusCode() {
    return this.statusCode;
  }

  setStatusCode(statusCode: number) {
    this.statusCode = statusCode;
  }

  getData() {
    return this.data;
  }

  setData(data: any) {
    this.data = data;
  }

  getMessage() {
    return this.message;
  }

  setMessage(message: any) {
    this.message = message;
  }

  dataResponseSkeleton() {
    return {
      statusCode: this.getStatusCode(),
      data: this.getData(),
      message: this.getMessage(),
    };
  }

  successResponse(data: any, message) {
    this.setStatusCode(HttpStatus.OK);
    this.setMessage(message);
    this.setData(data);
    return this.dataResponseSkeleton();
  }


  deleteResponse(message) {
    this.setStatusCode(HttpStatus.NO_CONTENT);
    this.setMessage(message);
    this.setData(null);
    return this.dataResponseSkeleton();
  }


  createdResponse(data, message) {
    this.setStatusCode(HttpStatus.CREATED);
    this.setData(data);
    this.setMessage(message);
    return this.dataResponseSkeleton();
  }
}
