import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const {
      labId,
      testId,
      bookingType,
      patientName,
      patientAge,
      bookingDate,
      bookingTime,
      address,
      city,
      state,
      pincode,
      phone,
      notes,
      prescriptionUrl,
      totalAmount,
    } = body

    // Get test to check type
    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    const isHomeCollection = bookingType === 'HOME_COLLECTION' || test.testType === 'HOME_TEST'

    // Validate required fields based on booking type
    if (!labId || !testId || !patientName || !patientAge || !phone || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Home collection requires address, pincode, state, and prescription
    if (isHomeCollection) {
      if (!address || !pincode || !state) {
        return NextResponse.json(
          { error: 'Address, pincode, and state are required for home collection' },
          { status: 400 }
        )
      }
      if (!prescriptionUrl) {
        return NextResponse.json(
          { error: 'Prescription is required for home collection tests' },
          { status: 400 }
        )
      }
    } else {
      // Clinic visit requires date and time
      if (!bookingDate || !bookingTime) {
        return NextResponse.json(
          { error: 'Date and time are required for clinic visits' },
          { status: 400 }
        )
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        labId,
        bookingType: isHomeCollection ? 'HOME_COLLECTION' : 'CLINIC_VISIT',
        patientName,
        patientAge: parseInt(patientAge),
        bookingDate: isHomeCollection ? null : (bookingDate ? new Date(bookingDate) : null),
        bookingTime: isHomeCollection ? null : bookingTime,
        address: isHomeCollection ? address : null,
        city,
        state: isHomeCollection ? state : null,
        pincode: isHomeCollection ? pincode : null,
        phone,
        notes: notes || null,
        prescriptionUrl: prescriptionUrl || null,
        totalAmount,
        status: 'PENDING',
        items: {
          create: {
            testId,
            price: totalAmount,
          },
        },
      },
      include: {
        items: {
          include: {
            test: true,
          },
        },
        lab: true,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const labId = searchParams.get('labId')
    const status = searchParams.get('status')
    
    // Build where clause based on user role
    const where: any = {}
    
    if (session.user.role === 'LAB') {
      // Lab users see bookings for their lab
      where.labId = session.user.labId || labId
    } else if (session.user.role === 'ADMIN') {
      // Admin can see all bookings
    } else {
      // Regular users see only their bookings
      where.userId = session.user.id
    }

    // Add status filter if provided
    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        items: {
          include: {
            test: true,
          },
        },
        lab: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
