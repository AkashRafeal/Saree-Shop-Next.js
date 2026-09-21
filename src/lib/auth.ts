import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'SareeShopSuperSecretLuxuryKey2026WithSufficientLengthForHMACSHA256Algorithm';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION_MS ? `${parseInt(process.env.JWT_EXPIRATION_MS) / 1000}s` : '24h';

export interface TokenPayload {
  id: number;
  email: string;
  roles: string[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    subject: payload.email,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email || decoded.sub,
      roles: decoded.roles || [],
    };
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: BigInt(payload.id) },
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });

  if (!user || !user.active) {
    return null;
  }

  const roles = user.user_roles.map((ur: any) => ur.roles.name as string);
  return {
    id: Number(user.id),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone || '',
    roles,
    user,
  };
}

export function requireAdmin(authUser: { roles: string[] } | null): boolean {
  if (!authUser) return false;
  return authUser.roles.includes('ROLE_ADMIN');
}
