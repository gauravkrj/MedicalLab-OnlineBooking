import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radiusKm = parseFloat(searchParams.get('radius') || '30') // Default 30km

    const where: any = {
      isActive: true,
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get all active tests first
    let tests = await prisma.test.findMany({
      where,
      include: {
        lab: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            city: true,
            isActive: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Filter tests by location if coordinates provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude)
      const userLon = parseFloat(longitude)
      
      console.log(`[Tests API] Filtering tests for location: ${userLat}, ${userLon} within ${radiusKm}km`)
      console.log(`[Tests API] Total tests before filtering: ${tests.length}`)

      tests = tests.filter(test => {
        // If test belongs to a specific lab, check that lab's location
        if (test.labId && test.lab) {
          if (!test.lab.latitude || !test.lab.longitude) {
            console.log(`[Tests API] Test ${test.id} filtered: Lab ${test.labId} has no coordinates`)
            return false // Lab doesn't have coordinates
          }
          if (!test.lab.isActive) {
            console.log(`[Tests API] Test ${test.id} filtered: Lab ${test.labId} is not active`)
            return false // Lab is not active
          }
          const distance = calculateDistance(
            userLat,
            userLon,
            test.lab.latitude,
            test.lab.longitude
          )
          const isWithinRadius = distance <= radiusKm
          console.log(`[Tests API] Test ${test.id} from lab ${test.labId}: distance=${distance.toFixed(2)}km, within radius=${isWithinRadius}`)
          // Show tests even if lab is not verified (for now - can require verification later)
          return isWithinRadius
        }

        // For general tests (no labId), we need to check if any lab offering this test is within radius
        // We'll handle this by checking LabTest associations
        // For now, if no labId, we'll include it (labs will filter on their end)
        return true
      })
      
      console.log(`[Tests API] Tests after lab-specific filtering: ${tests.length}`)

      // For general tests (no labId), verify they have at least one lab within radius
      // Get all labs within radius (include unverified labs for now)
      const allLabs = await prisma.lab.findMany({
        where: {
          isActive: true,
          // isVerified: true, // Allow unverified labs for now
          latitude: { not: null },
          longitude: { not: null },
        },
        select: {
          id: true,
          latitude: true,
          longitude: true,
        },
      })

      const labsWithinRadius = allLabs.filter(lab => {
        if (!lab.latitude || !lab.longitude) return false
        const distance = calculateDistance(
          userLat,
          userLon,
          lab.latitude!,
          lab.longitude!
        )
        return distance <= radiusKm
      })

      const labsWithinRadiusIds = new Set(labsWithinRadius.map(l => l.id))

      // For general tests (no labId), check if any lab offering it is within radius
      const generalTestIds = tests.filter(t => !t.labId).map(t => t.id)
      
      if (generalTestIds.length > 0 && labsWithinRadiusIds.size > 0) {
        // Check which general tests have labs within radius
        const labTestsWithinRadius = await prisma.labTest.findMany({
          where: {
            testId: { in: generalTestIds },
            labId: { in: Array.from(labsWithinRadiusIds) },
            isAvailable: true,
          },
          select: {
            testId: true,
          },
          distinct: ['testId'],
        })

        const availableGeneralTestIds = new Set(labTestsWithinRadius.map(lt => lt.testId))

        // Filter general tests to only those with labs within radius
        tests = tests.filter(test => {
          if (test.labId) {
            // Already filtered above (lab-specific tests)
            return true
          }
          // Only include if at least one lab offering it is within radius
          return availableGeneralTestIds.has(test.id)
        })
      } else if (labsWithinRadiusIds.size === 0) {
        // No labs within radius at all, filter out general tests (only show lab-specific tests that matched)
        tests = tests.filter(test => test.labId !== null)
      }
    }

    // Remove lab relation from response (not needed for client)
    const testsResponse = tests.map(test => ({
      id: test.id,
      name: test.name,
      description: test.description,
      category: test.category,
      price: test.price,
      duration: test.duration,
      testType: test.testType,
      labId: test.labId,
      labName: test.lab ? test.lab.name : null,
      isActive: test.isActive,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    }))

    console.log(`[Tests API] Returning ${testsResponse.length} tests`)
    return NextResponse.json(testsResponse)
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}
