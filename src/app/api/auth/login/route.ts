import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken, TOKEN_COOKIE_NAME, isStaffOrAdmin } from '@/lib/auth';
import { mergeGuestCartIntoUser } from '@/lib/services/cartService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, guestToken } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        customerProfile: true,
        adminProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Merge guest cart if user had added items prior to logging in
    if (guestToken) {
      try {
        await mergeGuestCartIntoUser(user.id, guestToken);
      } catch (cartErr) {
        console.warn('Could not merge guest cart:', cartErr);
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const isStaff = isStaffOrAdmin(user.role);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isStaff,
      },
      message: 'Logged in successfully.',
    });

    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication.' },
      { status: 500 }
    );
  }
}
