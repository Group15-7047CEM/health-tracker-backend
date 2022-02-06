import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.headers.authorization) {
        const authHeader: string = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        // const keys = await this.cacheManager.store.keys('*');
        const blockedJwt = await this.cacheManager.get(
          'blockjwt:' + token.split('.')[2],
        );
        if (blockedJwt) {
          next(new Error('TokenExpired'));
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  }
}

// TODO: Add exception handler. Currently throws the error and returns generic error as following
/*
{
  "statusCode": 500,
  "message": "Internal server error"
}
*/
