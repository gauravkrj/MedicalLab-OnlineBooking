export enum TestType {
  HOME_TEST = 'HOME_TEST',
  CLINIC_TEST = 'CLINIC_TEST',
}

export enum BookingType {
  HOME_COLLECTION = 'HOME_COLLECTION',
  CLINIC_VISIT = 'CLINIC_VISIT',
}

export interface Test {
  id: string
  name: string
  description?: string
  category: string
  price: number
  duration?: number
  testType: TestType
  labId?: string | null
  labName?: string | null
  isActive: boolean
}

export interface Lab {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  distance?: number
}

export interface LabTest {
  id: string
  labId: string
  testId: string
  price?: number
  isAvailable: boolean
  lab?: Lab
  test?: Test
}

export interface Booking {
  id: string
  userId: string
  labId: string
  bookingType: BookingType
  patientName: string
  patientAge: number
  bookingDate?: string
  bookingTime?: string
  address?: string
  city: string
  state?: string
  pincode?: string
  phone: string
  status: BookingStatus
  prescriptionUrl?: string
  notes?: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: BookingItem[]
  lab?: Lab
}

export interface BookingItem {
  id: string
  bookingId: string
  testId: string
  price: number
  test?: Test
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SAMPLE_COLLECTED = 'SAMPLE_COLLECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CartItem {
  testId: string
  test: Test
  quantity: number
}
