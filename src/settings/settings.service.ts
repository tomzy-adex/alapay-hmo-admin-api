import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { SettingsRepository } from './repositories/settings.repository';
import { VerifyAccountDto, ResendVerificationDto } from './dto/verify-account.dto';
import { UpdateAccountDetailsDto } from './dto/update-account.dto';
import { UpdatePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/update-password.dto';
import { UploadCredentialsDto, UpdateCredentialDto, DeleteCredentialDto } from './dto/upload-credentials.dto';
import { EmailService } from '../email/email.service';
import { EncryptionService } from '../utils/encryption.service';
import { CacheService } from '../cache/cache.service';
import { SendEmailDto } from '../email/dto/send-email.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly emailService: EmailService,
    private readonly encryptionService: EncryptionService,
    private readonly cacheService: CacheService,
  ) {}

  async verifyAccount(payload: VerifyAccountDto) {
    try {
      const { email, verificationCode, userId } = payload;

      // Find user by email or userId
      const user = userId 
        ? await this.settingsRepository.findOne({ where: { id: userId } } as any) as User
        : await this.settingsRepository.findUserByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if already verified
      if (user.isEmailVerified) {
        throw new BadRequestException('Account is already verified');
      }

      // Verify the code from cache
      const cachedCode = await this.cacheService.get(`verification:${user.email}`);
      if (!cachedCode || cachedCode !== verificationCode) {
        throw new BadRequestException('Invalid or expired verification code');
      }

      // Update user verification status
      await this.settingsRepository.verifyUserEmail(user.id);

      // Clear the verification code from cache
      await this.cacheService.del(`verification:${user.email}`);

      // Send verification success email
      const emailPayload: SendEmailDto = {
        to: user.email,
        subject: 'Account Verified Successfully',
        html: `
          <h2>Account Verification Successful</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your account has been successfully verified. You can now access all features of the platform.</p>
          <p>Thank you for choosing our service!</p>
        `,
      };

      await this.emailService.sendEmail(emailPayload);

      return {
        success: true,
        message: 'Account verified successfully',
        data: {
          userId: user.id,
          email: user.email,
          isEmailVerified: true,
          verifiedAt: new Date(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error verifying account:', error);
      throw new InternalServerErrorException('Failed to verify account');
    }
  }

  async resendVerification(payload: ResendVerificationDto) {
    try {
      const { email, userId } = payload;

      // Find user by email or userId
      const user = userId 
        ? await this.settingsRepository.findOne({ where: { id: userId } } as any) as User
        : await this.settingsRepository.findUserByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if already verified
      if (user.isEmailVerified) {
        throw new BadRequestException('Account is already verified');
      }

      // Generate new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store verification code in cache for 10 minutes
      await this.cacheService.set(`verification:${user.email}`, verificationCode, 600);

      // Send verification email
      const emailPayload: SendEmailDto = {
        to: user.email,
        subject: 'Account Verification Code',
        html: `
          <h2>Account Verification</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `,
      };

      await this.emailService.sendEmail(emailPayload);

      return {
        success: true,
        message: 'Verification code sent successfully',
        data: {
          email: user.email,
          expiresIn: '10 minutes',
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error resending verification:', error);
      throw new InternalServerErrorException('Failed to resend verification code');
    }
  }

  async updateAccountDetails(userId: string, payload: UpdateAccountDetailsDto) {
    try {
      // Check if user exists
      const user = await this.settingsRepository.findOne({ where: { id: userId } } as any) as User;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check for email uniqueness if email is being updated
      if (payload.email && payload.email !== user.email) {
        const existingUser = await this.settingsRepository.checkEmailExists(payload.email, userId);
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
      }

      // Check for phone uniqueness if phone is being updated
      if (payload.phoneNumber && payload.phoneNumber !== user.phoneNumber) {
        const existingUser = await this.settingsRepository.checkPhoneExists(payload.phoneNumber, userId);
        if (existingUser) {
          throw new ConflictException('Phone number already exists');
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (payload.firstName) updateData.firstName = payload.firstName;
      if (payload.middleName !== undefined) updateData.middleName = payload.middleName;
      if (payload.lastName) updateData.lastName = payload.lastName;
      if (payload.email) updateData.email = payload.email;
      if (payload.phoneNumber) updateData.phoneNumber = payload.phoneNumber;
      if (payload.dob) updateData.dob = new Date(payload.dob);
      if (payload.bloodGroup) updateData.bloodGroup = payload.bloodGroup;
      if (payload.height) updateData.height = payload.height;
      if (payload.genotype) updateData.genotype = payload.genotype;
      if (payload.gender) updateData.gender = payload.gender;
      if (payload.profilePix) updateData.profilePix = payload.profilePix;

      // Update user profile
      await this.settingsRepository.updateUserProfile(userId, updateData);

      // Get updated user data
      const updatedUser = await this.settingsRepository.getUserSettings(userId);

      return {
        success: true,
        message: 'Account details updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Error updating account details:', error);
      throw new InternalServerErrorException('Failed to update account details');
    }
  }

  async updatePassword(userId: string, payload: UpdatePasswordDto) {
    try {
      const { currentPassword, newPassword, confirmPassword } = payload;

      // Check if user exists
      const user = await this.settingsRepository.findOne({ where: { id: userId } } as any) as User;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.encryptionService.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Check if new password matches confirmation
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('New password and confirmation password do not match');
      }

      // Check if new password is same as current password
      const isNewPasswordSame = await this.encryptionService.compare(newPassword, user.password);
      if (isNewPasswordSame) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Hash new password
      const hashedPassword = await this.encryptionService.hash(newPassword);

      // Update password
      await this.settingsRepository.updateUserPassword(userId, hashedPassword);

      // Send password change notification email
      const emailPayload: SendEmailDto = {
        to: user.email,
        subject: 'Password Changed Successfully',
        html: `
          <h2>Password Changed</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <p>Thank you for keeping your account secure!</p>
        `,
      };

      await this.emailService.sendEmail(emailPayload);

      return {
        success: true,
        message: 'Password updated successfully',
        data: {
          userId: user.id,
          email: user.email,
          passwordChangedAt: new Date(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating password:', error);
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async forgotPassword(payload: ForgotPasswordDto) {
    try {
      const { email } = payload;

      // Find user by email
      const user = await this.settingsRepository.findUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent',
        };
      }

      // Generate reset token
      const resetToken = this.encryptionService.generateRandomToken(32);

      // Store reset token in cache for 1 hour
      await this.cacheService.set(`reset:${resetToken}`, user.id, 3600);

      // Send password reset email
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const emailPayload: SendEmailDto = {
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.firstName},</p>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        `,
      };

      await this.emailService.sendEmail(emailPayload);

      return {
        success: true,
        message: 'Password reset link sent successfully',
        data: {
          email: user.email,
          expiresIn: '1 hour',
        },
      };
    } catch (error) {
      console.error('Error processing forgot password:', error);
      throw new InternalServerErrorException('Failed to process password reset request');
    }
  }

  async resetPassword(payload: ResetPasswordDto) {
    try {
      const { resetToken, newPassword, confirmPassword } = payload;

      // Check if new password matches confirmation
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('New password and confirmation password do not match');
      }

      // Get user ID from cache
      const userId = await this.cacheService.get(`reset:${resetToken}`);
      if (!userId) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Find user
      const user = await this.settingsRepository.findOne({ where: { id: userId } } as any) as User;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hash new password
      const hashedPassword = await this.encryptionService.hash(newPassword);

      // Update password
      await this.settingsRepository.updateUserPassword(userId as string, hashedPassword);

      // Clear reset token from cache
      await this.cacheService.del(`reset:${resetToken}`);

      // Send password reset confirmation email
      const emailPayload: SendEmailDto = {
        to: user.email,
        subject: 'Password Reset Successful',
        html: `
          <h2>Password Reset Successful</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your password has been successfully reset.</p>
          <p>You can now log in with your new password.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
        `,
      };

      await this.emailService.sendEmail(emailPayload);

      return {
        success: true,
        message: 'Password reset successfully',
        data: {
          userId: user.id,
          email: user.email,
          passwordResetAt: new Date(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error resetting password:', error);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async uploadCredentials(userId: string, payload: UploadCredentialsDto) {
    try {
      // Check if user exists
      const user = await this.settingsRepository.findOne({ where: { id: userId } } as any) as User;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // In a real implementation, you would save credentials to a separate table
      // For now, we'll simulate the credential upload
      const credential = {
        id: this.encryptionService.generateRandomToken(16),
        userId: user.id,
        credentialType: payload.credentialType,
        title: payload.title,
        description: payload.description,
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
        fileType: payload.fileType,
        expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : null,
        issuingAuthority: payload.issuingAuthority,
        credentialNumber: payload.credentialNumber,
        metadata: payload.metadata ? JSON.parse(payload.metadata) : null,
        uploadedAt: new Date(),
        status: 'pending', // pending, approved, rejected
      };

      // Send notification email to admin for credential review
      const emailPayload: SendEmailDto = {
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        subject: 'New Credential Upload',
        html: `
          <h2>New Credential Upload</h2>
          <p>A new credential has been uploaded by ${user.firstName} ${user.lastName}.</p>
          <p><strong>Credential Type:</strong> ${payload.credentialType}</p>
          <p><strong>Title:</strong> ${payload.title}</p>
          <p><strong>User Email:</strong> ${user.email}</p>
          <p>Please review and approve/reject this credential.</p>
        `,
      };

      await this.emailService.sendEmail(emailPayload);

      return {
        success: true,
        message: 'Credentials uploaded successfully',
        data: {
          credentialId: credential.id,
          credentialType: credential.credentialType,
          title: credential.title,
          status: credential.status,
          uploadedAt: credential.uploadedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error uploading credentials:', error);
      throw new InternalServerErrorException('Failed to upload credentials');
    }
  }

  async getUserCredentials(userId: string) {
    try {
      // Check if user exists
      const user = await this.settingsRepository.findOne({ where: { id: userId } } as any) as User;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // In a real implementation, you would fetch from credentials table
      const credentials = await this.settingsRepository.getUserCredentials(userId);

      return {
        success: true,
        message: 'User credentials retrieved successfully',
        data: {
          userId: user.id,
          credentials,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error getting user credentials:', error);
      throw new InternalServerErrorException('Failed to get user credentials');
    }
  }

  async updateCredential(userId: string, payload: UpdateCredentialDto) {
    try {
      // Check if user exists
      const user = await this.settingsRepository.findOne({ where: { id: userId } } as any) as User;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // In a real implementation, you would update the credential in the database
      // For now, we'll simulate the update
      const updatedCredential = {
        id: payload.credentialId,
        userId: user.id,
        title: payload.title,
        description: payload.description,
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : null,
        issuingAuthority: payload.issuingAuthority,
        credentialNumber: payload.credentialNumber,
        updatedAt: new Date(),
      };

      return {
        success: true,
        message: 'Credential updated successfully',
        data: updatedCredential,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating credential:', error);
      throw new InternalServerErrorException('Failed to update credential');
    }
  }

  async deleteCredentials(userId: string, payload: DeleteCredentialDto) {
    try {
      // Check if user exists
      const user = await this.settingsRepository.findOne({ where: { id: userId } } as any) as User;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // In a real implementation, you would delete credentials from the database
      const deletedCount = payload.credentialIds.length;

      return {
        success: true,
        message: `${deletedCount} credential(s) deleted successfully`,
        data: {
          userId: user.id,
          deletedCredentialIds: payload.credentialIds,
          deletedCount,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting credentials:', error);
      throw new InternalServerErrorException('Failed to delete credentials');
    }
  }

  async getUserSettings(userId: string) {
    try {
      const userSettings = await this.settingsRepository.getUserSettings(userId);
      
      if (!userSettings) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        message: 'User settings retrieved successfully',
        data: userSettings,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error getting user settings:', error);
      throw new InternalServerErrorException('Failed to get user settings');
    }
  }

  async getUserVerificationStatus(userId: string) {
    try {
      const verificationStatus = await this.settingsRepository.getUserVerificationStatus(userId);
      
      if (!verificationStatus) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        message: 'User verification status retrieved successfully',
        data: verificationStatus,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error getting user verification status:', error);
      throw new InternalServerErrorException('Failed to get user verification status');
    }
  }

  async getUserActivityStats(userId: string) {
    try {
      const activityStats = await this.settingsRepository.getUserActivityStats(userId);
      
      return {
        success: true,
        message: 'User activity stats retrieved successfully',
        data: activityStats,
      };
    } catch (error) {
      console.error('Error getting user activity stats:', error);
      throw new InternalServerErrorException('Failed to get user activity stats');
    }
  }

  async getUserSecuritySettings(userId: string) {
    try {
      const securitySettings = await this.settingsRepository.getUserSecuritySettings(userId);
      
      return {
        success: true,
        message: 'User security settings retrieved successfully',
        data: securitySettings,
      };
    } catch (error) {
      console.error('Error getting user security settings:', error);
      throw new InternalServerErrorException('Failed to get user security settings');
    }
  }
}
