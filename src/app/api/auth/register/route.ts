import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { hashPassword, signToken } from '@/lib/auth';
import { serializeUser } from '@/lib/serializers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return apiError('Email, password, first name, and last name are required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError('User with this email already exists', 400);
    }

    // Customer role
    let customerRole = await prisma.role.findUnique({
      where: { name: 'ROLE_CUSTOMER' },
    });

    if (!customerRole) {
      customerRole = await prisma.role.create({
        data: { name: 'ROLE_CUSTOMER' },
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone ? phone.trim() : null,
        active: true,
        user_roles: {
          create: {
            role_id: customerRole.id,
          },
        },
        carts: {
          create: {},
        },
        wishlists: {
          create: {},
        },
      },
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    const userDto = serializeUser(newUser);
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
      'Registration successful',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return apiError(error.message || 'Registration failed', 500);
  }
}
