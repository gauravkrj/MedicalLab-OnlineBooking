import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const pincode = searchParams.get('pincode')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const testId = searchParams.get('testId')

    // Build location filter
    const locationWhere: any = {
      isActive: true,
      // For now, show all active labs (remove isVerified requirement for testing)
      // isVerified: true, 
    }

    if (city) {
      locationWhere.city = { contains: city, mode: 'insensitive' }
    }

    if (pincode) {
      locationWhere.pincode = pincode
    }

    let labs: any[] = []

    // If testId is provided, find labs that offer this test
    if (testId) {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        select: { labId: true, isActive: true },
      })

      if (!test || !test.isActive) {
        console.log('Test not found or inactive:', testId)
        return NextResponse.json([])
      }

      // Get all labs matching location (if location is provided)
      const locationLabs = await prisma.lab.findMany({
        where: locationWhere,
      })

      if (locationLabs.length === 0 && (city || pincode)) {
        console.log('No labs found matching location')
        return NextResponse.json([])
      }

      const locationLabIds = locationLabs.map(l => l.id)
      const foundLabIds = new Set<string>()

      // Case 1: Test belongs to a specific lab (labId is set)
      // Check if that lab is in our location matches
      if (test.labId) {
        const ownerLab = locationLabs.find(l => l.id === test.labId)
        if (ownerLab && ownerLab.isActive) {
          foundLabIds.add(ownerLab.id)
          labs.push(ownerLab)
          console.log(`Found owner lab: ${ownerLab.name}`)
        }
      }

      // Case 2: Find labs that have this test through LabTest associations
      // Only search within labs that match location
      if (locationLabIds.length > 0) {
        const labTests = await prisma.labTest.findMany({
          where: {
            labId: { in: locationLabIds },
            testId: testId,
            isAvailable: true,
          },
          include: {
            lab: true,
          },
        })

        // Add labs that aren't already included
        labTests.forEach(lt => {
          if (lt.lab && lt.lab.isActive && !foundLabIds.has(lt.lab.id)) {
            foundLabIds.add(lt.lab.id)
            labs.push(lt.lab)
          }
        })
      }

      console.log(`Found ${labs.length} lab(s) offering test ${testId}`)
    } else {
      // No testId - just find labs by location
      labs = await prisma.lab.findMany({
        where: locationWhere,
      })
      console.log(`Found ${labs.length} lab(s) by location only`)
    }

    // Calculate distance if coordinates are provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude)
      const userLon = parseFloat(longitude)
      
      labs = labs.map(lab => {
        if (lab.latitude && lab.longitude) {
          const distance = calculateDistance(userLat, userLon, lab.latitude, lab.longitude)
          return { ...lab, distance }
        }
        return lab
      })

      // Sort by distance
      labs.sort((a, b) => {
        const distA = (a as any).distance ?? Infinity
        const distB = (b as any).distance ?? Infinity
        return distA - distB
      })
    }

    return NextResponse.json(labs)
  } catch (error) {
    console.error('Error fetching labs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch labs' },
      { status: 500 }
    )
  }
}
