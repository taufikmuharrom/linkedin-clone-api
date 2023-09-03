import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controlles/auth.controller';
import { UserEntity } from './models/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [AuthService, JwtGuard, JwtStrategy, RolesGuard],
  controllers: [AuthController],
})
export class AuthModule {}
