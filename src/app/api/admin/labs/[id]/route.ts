import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { isVerified, isActive } = body

    const updateData: any = {}
    if (typeof isVerified === 'boolean') {
      updateData.isVerified = isVerified
    }
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }

    const lab = await prisma.lab.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error updating lab:', error)
    return NextResponse.json(
      { error: 'Failed to update lab' },
      { status: 500 }
    )
  }
}

