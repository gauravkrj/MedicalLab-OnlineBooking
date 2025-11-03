import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Configure Cloudinary inside the function
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    })
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      )
    }

    // Check Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary configuration missing:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
      })
      return NextResponse.json(
        { error: 'Cloudinary is not configured. Please check environment variables.' },
        { status: 500 }
      )
    }

    // Convert file to base64 string for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64String}`

    // Upload to Cloudinary
    let uploadResult
    try {
      uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: 'prescriptions',
        resource_type: 'auto', // Automatically detect image or raw (PDF)
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      })
    } catch (e: any) {
      // Common 404 cause: wrong CLOUDINARY_CLOUD_NAME → results in HTML 404 page
      if (e?.http_code === 404) {
        console.error('Cloudinary 404 likely due to invalid cloud name:', process.env.CLOUDINARY_CLOUD_NAME)
        return NextResponse.json(
          { error: 'Cloudinary returned 404. Please verify CLOUDINARY_CLOUD_NAME is correct.' },
          { status: 500 }
        )
      }
      throw e
    }

    return NextResponse.json({ 
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload file'
    if (error?.message) {
      errorMessage = error.message
    } else if (error?.error?.message) {
      errorMessage = error.error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Simple GET to verify the route exists
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
