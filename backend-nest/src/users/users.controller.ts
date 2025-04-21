import { Controller, Post, Body, ConflictException, UseGuards, Request, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    // Check if username already exists
    const existingUser = await this.usersService.findByUsername(createAdminDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    // Create the admin user
    return this.usersService.create({
      username: createAdminDto.username,
      password: hashedPassword,
      role: 'admin',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(@Request() req, @Body() resetPasswordDto: ResetPasswordDto) {
    this.logger.log('Reset password request received');
    this.logger.debug(`User data in request: ${JSON.stringify(req.user)}`);
    this.logger.debug(`Request body keys: ${JSON.stringify(Object.keys(resetPasswordDto))}`);
    
    // Extract user ID from JWT payload
    // The JWT strategy in auth/strategies/jwt.strategy.ts sets userId from the sub claim
    const userId = req.user.userId;
    
    if (!userId) {
      this.logger.error('User ID not found in token payload');
      this.logger.debug(`Full user object: ${JSON.stringify(req.user)}`);
      throw new ConflictException('Invalid user authentication');
    }
    
    try {
      this.logger.log(`Attempting to reset password for user ID: ${userId}`);
      const result = await this.usersService.resetPassword(
        userId,
        resetPasswordDto.currentPassword,
        resetPasswordDto.newPassword
      );
      this.logger.log('Password reset successful');
      return { message: 'Password successfully updated' };
    } catch (error) {
      this.logger.error(`Password reset error: ${error.message}`);
      throw error;
    }
  }
} 