import mongoose from 'mongoose'
import { ApiError } from './ApiError.js'

export const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export const ensureRequiredString = (value, label) => {
  if (!String(value || '').trim()) {
    throw new ApiError(400, `${label} is required`)
  }
}

export const ensureObjectId = (value, label = 'Id') => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `Invalid ${label}`)
  }
}

export const ensureArrayHasValues = (value, label) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError(400, `${label} is required`)
  }
}
