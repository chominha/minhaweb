import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Find user by username
    const user = await prisma.user.findUnique({
      where: {
        username: username
      }
    });

    // If user doesn't exist
    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'INVALID_PASSWORD' },
        { status: 401 }
      );
    }

    // Login successful
    return NextResponse.json(
      { 
        message: '로그인 성공',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 