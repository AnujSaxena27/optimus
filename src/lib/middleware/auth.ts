/**
 * JWT Authentication Middleware
 * Verifies Supabase JWT tokens and extracts user information
 */

import { NextRequest, NextResponse } from 'next/server';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/config/constants';
import { JWTPayload } from '@/lib/utils/types';
import { logger } from '@/lib/services/logging';

/**
 * Extract JWT from Authorization header
 */
export function extractJWT(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify JWT is valid (basic structure check)
 * In production, use proper JWT library with Supabase public key
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    // Decode JWT without verification (for demo)
    // In production: use jsonwebtoken library with Supabase public key
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (not verified for now)
    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      logger.warn('JWT token has expired', { exp: decoded.exp });
      return null;
    }

    return decoded as JWTPayload;
  } catch (error) {
    logger.error(`JWT verification failed: ${String(error)}`);
    return null;
  }
}

/**
 * JWT Authentication middleware
 * Used to protect API endpoints
 */
export async function withAuth(request: NextRequest): Promise<{
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
}> {
  const token = extractJWT(request);

  if (!token) {
    logger.warn('Missing JWT token in request');
    return {
      isValid: false,
      error: ERROR_MESSAGES.JWT_MISSING,
    };
  }

  const payload = verifyJWT(token);

  if (!payload) {
    logger.warn('Invalid JWT token in request');
    return {
      isValid: false,
      error: ERROR_MESSAGES.JWT_INVALID,
    };
  }

  logger.debug('JWT verification successful', {
    userId: payload.sub,
    email: payload.email,
  });

  return {
    isValid: true,
    payload,
  };
}

/**
 * Error response helper
 */
export function unauthorizedResponse(message: string = ERROR_MESSAGES.JWT_INVALID) {
  return NextResponse.json(
    { error: message },
    { status: HTTP_STATUS.UNAUTHORIZED }
  );
}
