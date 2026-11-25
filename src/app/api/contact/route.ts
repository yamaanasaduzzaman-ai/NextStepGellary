import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required.' },
        { status: 400 }
      );
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. A Nexstep client concierge will respond within 24 hours.',
      inquiryId: inquiry.id,
    });
  } catch (error: any) {
    console.error('Contact inquiry error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
