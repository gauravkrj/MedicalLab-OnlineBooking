import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'LAB' || !session.user.labId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const test = await prisma.test.findFirst({
      where: { id, labId: session.user.labId },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json({ error: 'Failed to fetch test' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'LAB' || !session.user.labId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      price,
      duration,
      testType,
      about,
      parameters,
      preparation,
      why,
      interpretations,
      faqsJson,
      isActive,
    } = body

    const existing = await prisma.test.findFirst({ where: { id, labId: session.user.labId } })
    if (!existing) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const updated = await prisma.test.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration !== undefined && { duration: duration ? parseInt(duration) : null }),
        ...(testType !== undefined && { testType }),
        ...(about !== undefined && { about }),
        ...(parameters !== undefined && { parameters }),
        ...(preparation !== undefined && { preparation }),
        ...(why !== undefined && { why }),
        ...(interpretations !== undefined && { interpretations }),
        ...(faqsJson !== undefined && { faqsJson: Array.isArray(faqsJson) ? faqsJson : null }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'LAB' || !session.user.labId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const test = await prisma.test.findUnique({
      where: { id },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    if (test.labId !== session.user.labId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.test.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Test deleted successfully' })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    )
  }
}

