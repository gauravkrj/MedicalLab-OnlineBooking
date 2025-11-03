import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      password,
      role,
      labName,
      address,
      city,
      state,
      pincode,
      labPhone,
      latitude,
      longitude,
    } = body

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        role: role || 'USER',
        ...(role === 'LAB' && {
          labProfile: {
            create: {
              name: labName,
              address,
              city,
              state,
              pincode,
              phone: labPhone || phone,
              email,
              latitude: typeof latitude === 'number' ? latitude : (latitude ? parseFloat(latitude) : null),
              longitude: typeof longitude === 'number' ? longitude : (longitude ? parseFloat(longitude) : null),
            },
          },
        }),
      },
      include: {
        labProfile: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating user:', error)
    const message =
      (error?.code && error?.meta?.target)
        ? `Database error (${error.code}) on ${error.meta.target}`
        : (error?.message || 'Failed to create account')
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

