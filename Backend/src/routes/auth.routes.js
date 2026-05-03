import { Router } from 'express'
import { 
  bootstrapSuperadmin, 
  login, 
  logout, 
  me, 
  changePassword, 
  forgotPassword, 
  verifyOTP, 
  resetPassword,
  refreshTokens,
  register 
} from '../controllers/auth.controller.js'
import { auth } from '../middleware/auth.middleware.js'
import { authLimiter } from '../middleware/rateLimit.middleware.js'
import validation from '../middleware/validation.middleware.js'

const { login: loginValidator, register: registerValidator } = validation

const router = Router()

router.post('/bootstrap-superadmin', bootstrapSuperadmin)
router.post('/login', authLimiter, loginValidator, login)
router.post('/refresh', authLimiter, refreshTokens)
router.post('/logout', auth, logout)
router.get('/me', auth, me)
router.patch('/change-password', auth, changePassword)
router.post('/register', authLimiter, auth, registerValidator, register)

// Forgot Password Flow with Email OTP (rate limited)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/verify-otp', verifyOTP)
router.post('/reset-password', authLimiter, resetPassword)

export default router

