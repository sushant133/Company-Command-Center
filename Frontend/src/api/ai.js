import client, { unwrap } from './client'

/**
 * Send a message to the AI chatbot
 * @param {string} message - The user's message/query
 * @returns {Promise} AI response with analysis
 */
export const sendChatMessage = async (message) => {
  try {
    const response = await client.post('/ai/chat', {
      message: message.trim(),
    })

    return {
      success: true,
      data: response.data?.data,
      message: response.data?.message || 'Response received',
    }
  } catch (error) {
    console.error('Chatbot API Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get AI response',
      data: null,
    }
  }
}

/**
 * Generate AI insights for a company
 * @param {string} companyId - Company ID
 * @param {string} type - Type of insight (summary, risk, trend, prediction)
 * @returns {Promise} Generated insight
 */
export const generateInsight = async (companyId = null, type = 'summary') => {
  try {
    const response = await client.post('/ai/generate-insight', {
      companyId,
      type,
    })

    return unwrap(response)
  } catch (error) {
    console.error('Generate Insight Error:', error)
    throw error
  }
}

/**
 * Get all AI insights
 * @returns {Promise} List of insights
 */
export const getInsights = async () => {
  try {
    const response = await client.get('/ai/insights')
    return unwrap(response)
  } catch (error) {
    console.error('Get Insights Error:', error)
    throw error
  }
}

/**
 * Get insights for a specific company
 * @param {string} companyId - Company ID
 * @returns {Promise} Company-specific insights
 */
export const getCompanyInsights = async (companyId) => {
  try {
    const response = await client.get(`/ai/insights/company/${companyId}`)
    return unwrap(response)
  } catch (error) {
    console.error('Get Company Insights Error:', error)
    throw error
  }
}

export default {
  sendChatMessage,
  generateInsight,
  getInsights,
  getCompanyInsights,
}
