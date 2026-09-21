import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { comparePassword, signToken } from '@/lib/auth';
import { serializeUser } from '@/lib/serializers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email and password are required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user) {
      return apiError('Invalid email or password', 401);
    }

    if (!user.active) {
      return apiError('Account is disabled. Please contact support.', 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return apiError('Invalid email or password', 401);
    }

    const userDto = serializeUser(user);
    if (!userDto) {
      return apiError('User profile processing failed', 500);
    }
    const token = signToken({
      id: userDto.id,
      email: userDto.email,
      roles: userDto.roles,
    });

    return apiSuccess(
      {
        token,
        type: 'Bearer',
        user: userDto,
      },
      'Login successful'
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return apiError(error.message || 'Login failed', 500);
  }
}
