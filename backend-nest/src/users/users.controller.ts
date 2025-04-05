import { Controller, Post, Body, ConflictException, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
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
    return this.usersService.resetPassword(
      req.user.id,
      resetPasswordDto.currentPassword,
      resetPasswordDto.newPassword
    );
  }
} 