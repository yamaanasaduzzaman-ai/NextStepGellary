import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'nexstep-lux-fashion-jwt-secret-default-key-2026';
const TOKEN_COOKIE_NAME = 'nxg_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Optional quick validation check if user is still active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) return null;

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  } catch (error) {
    return null;
  }
}

export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'STORE_MANAGER',
  'ORDER_MANAGER',
  'INVENTORY_MANAGER',
  'CONTENT_MANAGER',
  'CUSTOMER_SUPPORT',
];

export function isStaffOrAdmin(role?: string): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

export function hasPermission(
  currentRole: string,
  requiredRoles: string[]
): boolean {
  if (currentRole === 'SUPER_ADMIN') return true;
  return requiredRoles.includes(currentRole);
}

export { TOKEN_COOKIE_NAME };
