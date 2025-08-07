import {
  Body,
  Controller,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AdminLogindto,
  ResetPasswordDto,
  UpdateAdminDto,
} from './dto/admin-login.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminGuard } from 'src/utils/guards/admin.guard';
import { AuditInterceptor } from 'src/audit-log/audit-interceptor.service';
import { AuditLog } from 'src/utils/decorators/audit-log.decorator';

@ApiTags('Auth')
@ApiBearerAuth('JWT')
@UseInterceptors(AuditInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Admin login',
    description: 'Authenticates an admin user and returns a JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @AuditLog('Post', 'Auth')
  async login(@Body() payload: AdminLogindto) {
    try {
      return await this.authService.login(payload);
    } catch (error) {
      console.error('Controller - Login error:', error);
      console.error('Controller - Error details:', {
        message: error.message,
        stack: error.stack,
        payload: payload
      });
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Put('logout')
  @ApiOperation({
    summary: 'Admin logout',
    description: 'Invalidates the current JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Put', 'Auth')
  async logout(@Query('token') token: string) {
    return await this.authService.logout(token);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Initiates the password reset process by sending a reset link',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @AuditLog('Post', 'Auth')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    return await this.authService.resetPassword(payload);
  }

  @Put('change-password')
  @ApiOperation({
    summary: 'Change password',
    description: 'Changes the password for an authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @AuditLog('Put', 'Auth')
  async changePassword(@Body() payload: UpdateAdminDto) {
    return await this.authService.changePassword(payload);
  }

  @Post('test-db')
  @ApiOperation({
    summary: 'Test database connection',
    description: 'Tests if the database connection is working',
  })
  async testDb() {
    try {
      const userCount = await this.authService.testDatabaseConnection();
      return {
        success: true,
        message: 'Database connection successful',
        userCount: userCount
      };
    } catch (error) {
      console.error('Database test error:', error);
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message
      };
    }
  }
}
