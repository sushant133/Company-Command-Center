import { useState, useRef, useEffect } from 'react'
import {
  Send, Trash2, Copy, MessageSquare, Bot, AlertCircle,
  Loader2, ChevronDown, Settings, Download, Zap, Lightbulb,
  TrendingUp, AlertTriangle, BarChart3,
} from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import { Card, CardContent } from './ui/Card'
import Badge from './ui/Badge'
import { sendChatMessage } from '../api/ai'

const QUICK_PROMPTS = [
  { icon: AlertTriangle, text: 'What are the key risks?', prompt: 'Show me the risks analysis for all companies' },
  { icon: TrendingUp, text: 'Growth opportunities', prompt: 'What are the growth opportunities?' },
  { icon: BarChart3, text: 'Performance summary', prompt: 'Give me a performance summary of each company' },
  { icon: Lightbulb, text: 'Strategic recommendations', prompt: 'List all companies' },
  { icon: Zap, text: 'Active tasks', prompt: 'Show pending tasks' },
  { icon: AlertCircle, text: 'Financial analysis', prompt: 'Show financial metrics' },
]

export default function AIChatbot({ companies = [], insights = [] }) {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Welcome to AI Chatbot! 🤖\n\nI\'m your intelligent business assistant. I can help you with:\n\n• **Company Analysis**: Get comprehensive company insights\n• **Financial Intelligence**: Revenue, profit, expenses, and cash flow analysis\n• **HR Analytics**: Workforce metrics, satisfaction, and insights\n• **Risk Assessment**: Identify potential threats and challenges\n• **Growth Strategies**: Discover expansion and improvement opportunities\n• **Performance Tracking**: Monitor KPIs and business metrics\n• **Task Management**: View and organize assignments\n• **Smart Comparisons**: Compare companies side-by-side\n• **General Assistance**: Ask anything about your business\n\nJust ask me anything! I understand natural language and can handle complex queries. 💡\n\n**Try asking:**\n- "Hi" or "Hello" - Get started with a greeting\n- "Help" or "What can you do?" - See all capabilities\n- "Tell me about [company]" - Get company details\n- "Show financial metrics" - Financial analysis\n- "What are the risks?" - Risk assessment',
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSendMessage = async (e, customInput = null) => {
    e.preventDefault()
    const messageText = customInput || input.trim()
    if (!messageText || loading) return

    // Add user message
    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call AI chatbot API
      const result = await sendChatMessage(messageText)

      if (!result.success) {
        throw new Error(result.error || 'Failed to get AI response')
      }

      // Add AI response
      const aiMessage = {
        type: 'ai',
        content: result.data?.aiMessage || 'Unable to process your request',
        timestamp: new Date().toISOString(),
        isError: result.data?.isError || false,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Chatbot Error:', error)
      // Add error message
      const errorMessage = {
        type: 'ai',
        content: `⚠️ Error: ${error.message}\n\nTips: Make sure you're logged in and check your internet connection.`,
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('Clear entire conversation history?')) {
      setMessages([
        {
          type: 'ai',
          content: 'Conversation cleared. How can I help you with your portfolio today?',
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content)
    setIsCopied(index)
    setTimeout(() => setIsCopied(null), 2000)
  }

  const handleDownloadConversation = () => {
    const transcript = messages
      .map((m) => `[${m.type === 'user' ? 'You' : 'AI'}]: ${m.content}`)
      .join('\n\n')
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-chat-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">AI Chatbot</h3>
              <p className="text-xs text-slate-500">Advanced business intelligence assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg p-2 hover:bg-slate-100 transition"
              title="Settings"
            >
              <Settings className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={handleDownloadConversation}
              className="rounded-lg p-2 hover:bg-slate-100 transition"
              title="Download conversation"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={handleClearHistory}
              className="rounded-lg p-2 hover:bg-red-50 transition"
              title="Clear history"
            >
              <Trash2 className="h-4 w-4 text-slate-600 hover:text-red-600" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-3">📚 What I Can Help With</p>
            <div className="space-y-2 text-xs text-slate-600">
              <p>💼 <strong>Company Details:</strong> "Tell me about [company name]" or "Show info"</p>
              <p>📊 <strong>Financial Analysis:</strong> "Show financial metrics" or "Revenue analysis"</p>
              <p>👥 <strong>HR Metrics:</strong> "Show HR insights" or "Employee data"</p>
              <p>⚠️ <strong>Risk Assessment:</strong> "What are the risks?" or "Show threats"</p>
              <p>📈 <strong>Growth Opportunities:</strong> "Growth opportunities" or "Expansion"</p>
              <p>📋 <strong>Task Management:</strong> "Show pending tasks" or "Assignments"</p>
              <p>🔄 <strong>Comparisons:</strong> "Compare [company1] vs [company2]"</p>
              <p>🏢 <strong>All Companies:</strong> "List all companies" or "Show portfolio"</p>
              <p>❓ <strong>Help:</strong> "Help" or "What can you do?" or any question</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white ${
                message.type === 'user'
                  ? 'bg-slate-800'
                  : message.isError
                    ? 'bg-red-600'
                    : 'bg-gradient-to-br from-violet-600 to-indigo-600'
              }`}
            >
              {message.type === 'user' ? (
                <MessageSquare className="h-4 w-4" />
              ) : message.isError ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>

            {/* Message */}
            <div className={`max-w-[70%] group`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.type === 'user'
                    ? 'bg-slate-800 text-white rounded-br-sm'
                    : message.isError
                      ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-sm shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                }`}
              >
                {message.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={i} className="font-semibold mt-2 first:mt-0">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    )
                  }
                  if (line.startsWith('| ')) {
                    return (
                      <div key={i} className="overflow-x-auto mt-2 first:mt-0">
                        <pre className="text-xs bg-slate-50 p-2 rounded border border-slate-200 whitespace-pre-wrap break-words">
                          {line}
                        </pre>
                      </div>
                    )
                  }
                  if (line.startsWith('- ') || line.startsWith('• ')) {
                    return (
                      <p key={i} className="ml-4 mt-1 first:mt-0">
                        • {line.substring(2)}
                      </p>
                    )
                  }
                  if (line.match(/^\d+\./)) {
                    return (
                      <p key={i} className="ml-4 mt-1 first:mt-0">
                        {line}
                      </p>
                    )
                  }
                  return (
                    line && (
                      <p key={i} className="mt-1 first:mt-0">
                        {line}
                      </p>
                    )
                  )
                })}
              </div>

              {/* Message Actions */}
              {message.type === 'ai' && !message.isError && (
                <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyMessage(message.content, index)}
                    className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition text-xs flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    {isCopied === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading State */}
        {loading && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                <span className="text-sm text-slate-600">Analyzing your portfolio...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && !loading && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Quick actions:</p>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {QUICK_PROMPTS.map((prompt, idx) => {
              const Icon = prompt.icon
              return (
                <button
                  key={idx}
                  onClick={(e) => handleSendMessage(e, prompt.prompt)}
                  className="text-left rounded-lg bg-white border border-slate-200 p-2 hover:border-violet-400 hover:bg-violet-50 transition text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3 w-3 text-violet-600 shrink-0" />
                    <span className="text-slate-700 font-medium">{prompt.text}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about company details, risks, financial data..."
            disabled={loading}
            className="rounded-xl border-slate-200 bg-slate-50 flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          💡 Tip: Ask specific questions about companies to get targeted analysis. Click ⚙️ for command examples.
        </p>
      </div>
    </div>
  )
}
