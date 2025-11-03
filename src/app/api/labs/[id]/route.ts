import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lab = await prisma.lab.findUnique({ where: { id: params.id } })
    if (!lab) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }
    return NextResponse.json(lab)
  } catch (error) {
    console.error('Error fetching lab by id:', error)
    return NextResponse.json({ error: 'Failed to fetch lab' }, { status: 500 })
  }
}


