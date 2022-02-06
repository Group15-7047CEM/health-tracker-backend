import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
// import { User } from '../../user-management/classes';
import { UserModel } from '../../user-management/models';
import { AuthenticationService } from '../authentication.service';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthenticationService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password): Promise<UserModel> {
    const user = await this.authService.validateUser(email, password);
    return user;
  }
}
