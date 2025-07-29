import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { CacheService } from '../cache/cache.service';
import { EncryptionService } from '../utils/encryption.service';
import { UserRepository } from '../user/repositories/user.repository';
import { ProcessStatus, Status, UserRoles } from '../utils/types';
import { EmailService } from '../email/email.service';
import { transformRoleType } from '../utils/helpers';
import { decode } from 'jsonwebtoken';
import {
  AdminLogindto,
  ResetPasswordDto,
  UpdateAdminDto,
} from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly encryptionService: EncryptionService,
    private readonly adminRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async login(payload: AdminLogindto) {
    const { email, password } = payload;
    try {
      const admin = await this.adminRepository.findOne({
        where: { email },
        relations: ['role', 'hmo'],
      });

      if (!admin) {
        throw new BadRequestException('Invalid email or password.');
      }

      if (admin.role.permission !== UserRoles.HMO_ADMIN)
        throw new BadRequestException(
          'You are not authorized for perform this action.',
        );

      if (admin.status !== ProcessStatus.APPROVED)
        throw new ForbiddenException(
          `Your account is ${admin.status}. Contact your supervisor.`,
        );

      if (admin.accountStatus !== Status.ACTIVE)
        throw new ForbiddenException(
          `Your account is ${admin.accountStatus}. Contact your supervisor.`,
        );

      if (!admin.isEmailVerified) {
        const adminType = transformRoleType(admin.role.permission);
        const subject = `Verify your ${adminType} Account`;
        await this.emailService.sendVerificationEmail(
          email,
          admin.firstName,
          subject,
        );

        throw new BadRequestException(
          `Please, verify your account. A verification code has been sent to ${email}`,
        );
      }

      const isPasswordOkay = await this.encryptionService.compare(
        password,
        admin.password,
      );

      if (!isPasswordOkay) {
        throw new BadRequestException('Invalid email or password.');
      }

      const sessId = v4();

      delete admin.password;
      await this.cacheService.set(`${admin.role.permission}::${sessId}`, {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        phoneNumber: admin.phoneNumber,
        role: admin.role.permission,
        hmoId: admin.hmo?.id,
        sessId,
      });

      const { id, firstName, lastName, isEmailVerified, status, role } = admin;

      return {
        message: 'Login successful.',
        status: true,
        data: {
          id,
          firstName,
          lastName,
          email,
          isEmailVerified,
          status,
          role: role.permission,
        },
        token: this.encryptionService.generateToken({
          sub: sessId,
          type: admin.role.permission,
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(token: string) {
    // Add the token to the blacklist
    const payload = decode(token) as any;
    if (!payload) throw new NotFoundException('Invalid token');

    const blacklisted = await this.cacheService.isBlacklisted(token);
    await this.cacheService.remove(`${payload.type}::${payload.sub}`);

    if (blacklisted)
      throw new BadRequestException('You are already logged out');

    const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
    await this.cacheService.addToBlacklist(token, expiresIn);

    return { success: true, message: 'Log out successful.' };
  }

  async resetPassword(payload: ResetPasswordDto) {
    try {
      const { email } = payload;
      const user = await this.adminRepository.findOneBy({ email });
      if (!user) return null;
      const subject = 'Password Reset Code';

      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        subject,
      );

      return {
        success: true,
        message: `Password reset email sent successfully.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Forgot password could not be completed:',
        error,
      );
    }
  }

  async changePassword(payload: UpdateAdminDto) {
    try {
      const { code, password } = payload;
      const redisClient = this.cacheService;

      const email = await redisClient.get(`verify-account:${code}`);

      if (!email) {
        throw new BadRequestException('Invalid or expired verification link.');
      }

      const user = await this.adminRepository.findOneBy({
        email: email as string,
      });

      if (!user) throw new NotFoundException('User does not exist.');

      const hashedPassword = await this.encryptionService.hash(password);

      await this.adminRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
        },
      );
      await redisClient.remove(`verify-account:${code}`);

      return {
        success: true,
        message: `Password updated successfully.`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Change password could not be completed:',
        error,
      );
    }
  }
}
