'use client'

import { useState } from 'react'
import { Upload, X, File } from 'lucide-react'

interface PrescriptionUploadProps {
  onUploadComplete: (url: string | null) => void
}

export default function PrescriptionUpload({ onUploadComplete }: PrescriptionUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please upload a JPG, PNG, or PDF file')
        return
      }
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedUrl(data.url)
        onUploadComplete(data.url)
      } else {
        alert('Upload failed. Please try again.')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setUploadedUrl(null)
    onUploadComplete(null)
  }

  return (
    <div className="space-y-4">
      {!uploadedUrl ? (
        <>
          <div className="glass rounded-2xl p-6 text-center border-dashed border-2 border-white/10">
            <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-blue-400 hover:text-blue-300 font-semibold">
                Click to upload
              </span>
              <span className="text-gray-400"> or drag and drop</span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG, PDF up to 5MB
            </p>
          </div>

          {file && (
            <div className="glass rounded-xl p-4 flex items-center justify-between border-white/10">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="gradient-primary text-white px-4 py-2 rounded-lg hover:scale-105 transition text-sm font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass rounded-xl p-4 flex items-center justify-between border-green-500/30 bg-green-500/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
              <File className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-300">Prescription uploaded</p>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-300 hover:underline"
              >
                View file
              </a>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-green-300 hover:text-green-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
