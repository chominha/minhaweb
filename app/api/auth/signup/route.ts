import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Received signup request');
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });

    const { email, password, username, name, phone } = body;

    // 필수 필드 확인
    if (!email || !password || !username || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, username: !!username, name: !!name });
      return NextResponse.json(
        { ok: false, error: '모든 필수 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 확인
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { ok: false, error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // // 비밀번호 길이 확인
    // if (password.length < 6) {
    //   console.log('Password too short');
    //   return NextResponse.json(
    //     { ok: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' },
    //     { status: 400 }
    //   );
    // }

    // 이메일 중복 확인
    console.log('Checking for existing user with email:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Email already in use:', email);
      return NextResponse.json(
        { ok: false, error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해싱
    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 생성
    console.log('Creating new user');
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        name,
        phone: phone || ''
      }
    });

    console.log('User created successfully:', { id: newUser.id, email: newUser.email });

    // 민감한 데이터 제외하고 반환
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { 
        ok: true,
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    // Prisma 관련 오류 처리
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json(
        { ok: false, error: `이미 사용 중인 ${field === 'email' ? '이메일' : field === 'username' ? '아이디' : field === 'phone' ? '전화번호' : '정보'}입니다.` },
        { status: 400 }
      );
    }

    // 데이터베이스 연결 오류
    if (error.code === 'P1001' || error.code === 'P1008') {
      return NextResponse.json(
        { ok: false, error: '데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        ok: false,
        error: '회원가입 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}