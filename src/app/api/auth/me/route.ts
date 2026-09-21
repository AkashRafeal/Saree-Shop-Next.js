import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeUser } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const userDto = serializeUser(authUser.user);
    return apiSuccess(userDto, 'Current user profile');
  } catch (error: any) {
    console.error('Get profile error:', error);
    return apiError(error.message || 'Failed to fetch user profile', 500);
  }
}
