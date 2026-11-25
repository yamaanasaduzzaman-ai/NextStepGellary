import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to the Nexstep Editorial Gazette.',
      });
    }

    await prisma.newsletterSubscriber.create({
      data: { email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to Nexstep Gallery.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to subscribe.' }, { status: 500 });
  }
}
