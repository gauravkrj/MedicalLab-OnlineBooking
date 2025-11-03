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

    const lab = await prisma.lab.findUnique({
      where: { id: session.user.labId },
    })

    if (!lab) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error fetching lab profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'LAB' || !session.user.labId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, address, city, state, pincode, phone, email, latitude, longitude } = body

    const lab = await prisma.lab.update({
      where: { id: session.user.labId },
      data: {
        name,
        address,
        city,
        state,
        pincode,
        phone,
        email: email || null,
        latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : undefined,
        longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : undefined,
      },
    })

    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error updating lab profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

