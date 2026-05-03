import AIInsight from '../models/AIInsight.js'
import Company from '../models/Company.js'
import { generatePlaceholderInsight, generateAIChatResponse } from '../services/ai.service.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'
import { ensureObjectId } from '../utils/validators.js'

// Chatbot message handler - main endpoint for chat
export const chatbotMessage = asyncHandler(async (req, res) => {
  const { message } = req.body
  const userId = req.user._id
  
  if (!message || !message.trim()) {
    throw new ApiError(400, 'Message cannot be empty')
  }
  
  // Generate AI response with userId for per-user caching
  const aiResponse = await generateAIChatResponse(message, userId.toString())
  
  return sendSuccess(res, {
    statusCode: 200,
    message: 'AI response generated successfully',
    data: {
      userMessage: message,
      aiMessage: aiResponse.content,
      isError: aiResponse.isError,
      fromCache: aiResponse.fromCache || false,
      cacheHit: aiResponse.cacheHit || false,
      timestamp: new Date().toISOString(),
    },
  })
})

export const generateInsight = asyncHandler(async (req, res) => {
  const { companyId = null, type = 'summary' } = req.body
  let companyName = 'all companies'

  if (companyId) {
    ensureObjectId(companyId, 'company id')
    const company = await Company.findById(companyId)

    if (!company) {
      throw new ApiError(404, 'Company not found')
    }

    companyName = company.name
  }

  const insight = await AIInsight.create({
    companyId,
    type,
    severity: 'medium',
    content: generatePlaceholderInsight({
      companyName,
      category: type,
    }),
  })

  return sendSuccess(res, {
    statusCode: 201,
    message: 'AI insight generated successfully',
    data: insight,
  })
})

export const getInsights = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'superadmin'
      ? {}
      : {
          $or: [{ companyId: req.user.companyId }, { companyId: null }],
        }

  const insights = await AIInsight.find(query).sort({ createdAt: -1 })

  return sendSuccess(res, {
    data: insights,
  })
})

export const getCompanyInsights = asyncHandler(async (req, res) => {
  const companyId =
    req.user.role === 'superadmin' ? req.params.companyId : req.user.companyId

  ensureObjectId(companyId, 'company id')

  const insights = await AIInsight.find({ companyId }).sort({ createdAt: -1 })

  return sendSuccess(res, {
    data: insights,
  })
})
