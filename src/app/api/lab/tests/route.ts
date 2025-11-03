import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'LAB' || !session.user.labId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tests = await prisma.test.findMany({
      where: {
        labId: session.user.labId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching lab tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'LAB' || !session.user.labId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, category, price, duration, testType } = body

    if (!name || !category || !price || !testType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const test = await prisma.test.create({
      data: {
        name,
        description,
        category,
        price: parseFloat(price),
        duration: duration ? parseInt(duration) : null,
        testType: testType || 'CLINIC_TEST',
        labId: session.user.labId,
        isActive: true,
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    )
  }
}

