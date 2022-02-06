import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ObjectSchema } from '@hapi/joi';

import { ErrorResponseBuilder } from '../http/response-builders/error';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query' || metadata.type === 'body') {
      if (!(value instanceof Object)) {
        return value;
      }

      const { error } = this.schema.validate(value, { abortEarly: false });

      if (error) {
        if (error.message) {
          new ErrorResponseBuilder().throwBadRequest([error.message]);
        }
        // throw new BadRequestException(new ResponseBuilder().badRequest(error.details.map(detail => detail.message)));
        new ErrorResponseBuilder().throwBadRequest(
          error.details.map(detail => detail.message),
        );
      }
    }
    return value;
  }
}
