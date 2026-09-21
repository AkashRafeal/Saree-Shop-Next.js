import { NextResponse } from 'next/server';

export interface StandardApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
}

export function apiSuccess<T>(data: T, message = 'Success', status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function apiError(message = 'An error occurred', status = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      data: details ?? null,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
