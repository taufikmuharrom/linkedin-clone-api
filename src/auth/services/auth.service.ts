import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Observable, from, map, switchMap } from 'rxjs';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 12));
  }

  registerAccount(user: User): Observable<User> {
    const { fullName, email, phone, password } = user;
    return this.hashPassword(password).pipe(
      switchMap((hashedPassword: string) => {
        return from(
          this.userRepository.save({
            fullName,
            email,
            phone,
            password: hashedPassword,
          }),
        ).pipe(
          map((user: User) => {
            delete user.password;
            return user;
          }),
        );
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return from(this.userRepository.findOne({ where: { email } })).pipe(
      switchMap((user: User) =>
        from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              delete user.password;
              return user;
            }
          }),
        ),
      ),
    );
  }

  async validateUserV2(email: string, password: string): Promise<any> {
    const userSelected = await this.userRepository.findOne({
      where: { email },
    });

    if (!userSelected) {
      throw new HttpException('A user is not found!', HttpStatus.NOT_FOUND);
    }

    const isValidatePassword = await bcrypt.compareSync(
      password,
      userSelected.password,
    );

    if (!isValidatePassword) {
      throw new HttpException(
        'email and password is not match!',
        HttpStatus.NOT_FOUND,
      );
    }
    delete userSelected.password;
    const getToken = await this.jwtService.signAsync({ userSelected });

    return { userSelected, token: getToken };
  }

  async login(user: User): Promise<{ user: User; token: string }> {
    const { email, password } = user;
    const userSelected = await this.validateUserV2(email, password);
    return userSelected;
    // return this.validateUser(email, password).pipe(
    //   switchMap((user: User) => {
    //     if (user) {
    //       //create JWT token
    //       return from(this.jwtService.signAsync({ user }));
    //     }
    //   }),
    // );
  }
}
