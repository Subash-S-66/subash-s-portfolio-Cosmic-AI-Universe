import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { body, validationResult } from 'express-validator'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Always log port information for debugging
console.log(`🔧 Environment PORT: ${process.env.PORT}`)
console.log(`🔧 Using PORT: ${PORT}`)
console.log(`🔧 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'SET' : 'NOT SET'}`)
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`)

// Trust proxy for rate limiting (required for Render.com)
app.set('trust proxy', 1)

// Resolve __dirname for ESM so static files are served relative to this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
// Helmet + CSP: allow Zeabur host and Google Fonts for styles and fonts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Allow stylesheet links (external and element-level) from known deployment hosts and Google Fonts
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        process.env.CLIENT_URL || 'https://subash-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app',
        process.env.GITHUB_PAGES_URL || 'https://subash-s-66.github.io'
      ],
      styleSrcElem: [
        "'self'",
        "https://fonts.googleapis.com",
        process.env.CLIENT_URL || 'https://subash-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app',
        process.env.GITHUB_PAGES_URL || 'https://subash-s-66.github.io'
      ],
      // Allow scripts from self; keep unsafe-inline/eval to support some libs if needed
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      // Allow API connections from the app origin (Zeabur) and any configured API URL
      connectSrc: [
        "'self'",
        process.env.API_URL || process.env.CLIENT_URL || process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app'
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}))
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'https://subash-s-66.github.io/Subash-Portfolio',
    'https://subash-s-66.github.io',
    process.env.ZEABUR_URL || 'https://subash-portfolio.zeabur.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Contact form rate limiting (more restrictive)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact form submissions per windowMs
  message: 'Too many contact form submissions, please try again later.'
})

// Resend email configuration
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Nodemailer transporter (if SMTP env vars are provided)
let smtpTransporter = null
const usingSMTP = !!process.env.EMAIL_HOST && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD
if (usingSMTP) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

const sendEmailWithResend = async (to, subject, html, replyTo = null) => {
  if (!resend) throw new Error('Resend API key not configured')

  try {
    const emailData = {
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html
    }

    if (replyTo) {
      emailData.reply_to = replyTo
    }

    const result = await resend.emails.send(emailData)
    console.log('Resend email sent successfully:', result.data?.id)
    return result
  } catch (error) {
    console.error('Resend email sending failed:', error.message)
    throw error
  }
}

const sendEmailWithSMTP = async (to, subject, html, replyTo = null) => {
  if (!smtpTransporter) throw new Error('SMTP transporter not configured')

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html
  }

  if (replyTo) mailOptions.replyTo = replyTo

  const info = await smtpTransporter.sendMail(mailOptions)
  console.log('SMTP email sent:', info.messageId)
  return info
}

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

// Debug endpoints (temporary) to help verify CSP and the served index
app.get('/_debug/csp', (req, res) => {
  const csp = res.getHeader('content-security-policy') || res.getHeader('Content-Security-Policy') || 'not-set'
  res.json({ csp })
})

app.get('/_debug/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString()
  })
})

// Contact form endpoint
app.post('/api/contact', 
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('subject')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Subject must be between 5 and 100 characters'),
    body('message')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { name, email, subject, message } = req.body

      // Build main notification HTML
      const mainEmailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #050510; color: #e2e8f0; }
            .outer { background: linear-gradient(180deg, #050510 0%, #0a0a1f 50%, #050510 100%); padding: 40px 16px; }
            .wrapper { max-width: 640px; margin: 0 auto; }
            .container { background: linear-gradient(145deg, #0c0c20 0%, #0a0a18 100%); border-radius: 20px; overflow: hidden; border: 1px solid rgba(59,130,246,0.18); box-shadow: 0 0 80px rgba(59,130,246,0.06), 0 0 30px rgba(6,182,212,0.04), inset 0 1px 0 rgba(255,255,255,0.03); }
            .header { background: linear-gradient(135deg, #1e40af 0%, #2563eb 30%, #0ea5e9 60%, #06b6d4 100%); padding: 40px 32px; text-align: center; position: relative; }
            .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); }
            .header-icon { font-size: 36px; margin-bottom: 10px; display: block; }
            .header h2 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; text-shadow: 0 2px 16px rgba(0,0,0,0.3); }
            .header p { margin: 10px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.82); }
            .status-pill { display: inline-block; margin-top: 16px; padding: 5px 16px; border-radius: 100px; background: rgba(255,255,255,0.14); font-size: 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 2.5px; text-transform: uppercase; color: #ffffff; border: 1px solid rgba(255,255,255,0.12); }
            .status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #fb923c; margin-right: 8px; box-shadow: 0 0 8px #fb923c; vertical-align: middle; }
            .content { padding: 32px; }
            .card { background: linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(6,182,212,0.04) 100%); border: 1px solid rgba(59,130,246,0.12); border-radius: 14px; padding: 24px; margin: 14px 0; position: relative; overflow: hidden; }
            .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent); }
            .card-msg { background: linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(99,102,241,0.04) 100%); border-color: rgba(139,92,246,0.12); }
            .card-msg::before { background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent); }
            .card-ts { background: linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(16,185,129,0.04) 100%); border-color: rgba(6,182,212,0.12); text-align: center; }
            .card-ts::before { background: linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent); }
            .card-icon { font-size: 20px; margin-bottom: 6px; display: block; }
            .label { font-size: 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 12px; display: block; }
            .accent-bar { width: 45px; height: 3px; border-radius: 3px; margin-bottom: 14px; }
            .accent-b { background: linear-gradient(90deg, #3b82f6, #60a5fa); box-shadow: 0 0 12px rgba(59,130,246,0.4); }
            .accent-v { background: linear-gradient(90deg, #8b5cf6, #a78bfa); box-shadow: 0 0 12px rgba(139,92,246,0.4); }
            .accent-c { background: linear-gradient(90deg, #06b6d4, #22d3ee); box-shadow: 0 0 12px rgba(6,182,212,0.4); }
            .card h3 { margin: 0 0 14px 0; font-size: 17px; font-weight: 700; }
            .t-b { color: #93c5fd; }
            .t-v { color: #c4b5fd; }
            .t-c { color: #67e8f9; }
            .card p { margin: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; }
            .card strong { color: rgba(255,255,255,0.85); }
            .card a { color: #93c5fd; text-decoration: none; }
            .msg-box { background: rgba(0,0,0,0.2); border: 1px solid rgba(139,92,246,0.08); border-radius: 10px; padding: 18px; margin-top: 12px; }
            .msg-text { color: rgba(255,255,255,0.6); line-height: 1.75; white-space: pre-wrap; word-wrap: break-word; font-size: 14px; margin: 0; }
            .ts-text { margin: 0; color: #67e8f9; font-size: 13px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 0.5px; }
            .quick-action { margin-top: 20px; text-align: center; }
            .reply-btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(37,99,235,0.3); }
            .footer { background: #08081a; padding: 24px 32px; text-align: center; border-top: 1px solid rgba(59,130,246,0.06); }
            .footer p { margin: 0; font-size: 10px; color: rgba(255,255,255,0.2); font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 1px; }
            .footer span { color: rgba(251,146,60,0.5); }
          </style>
        </head>
        <body>
          <div class="outer">
            <div class="wrapper">
              <div class="container">
                <div class="header">
                  <span class="header-icon">&#128232;</span>
                  <h2>New Message Received</h2>
                  <p>Someone reached out through your portfolio</p>
                  <div class="status-pill"><span class="status-dot"></span>Action Required</div>
                </div>
                <div class="content">
                  <div class="card">
                    <span class="card-icon">&#128100;</span>
                    <span class="label">Sender Profile</span>
                    <div class="accent-bar accent-b"></div>
                    <h3 class="t-b">Contact Details</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Subject:</strong> ${subject}</p>
                  </div>
                  <div class="card card-msg">
                    <span class="card-icon">&#128172;</span>
                    <span class="label">Message Body</span>
                    <div class="accent-bar accent-v"></div>
                    <h3 class="t-v">Message</h3>
                    <div class="msg-box">
                      <p class="msg-text">${message.replace(/\n/g, '<br>')}</p>
                    </div>
                  </div>
                  <div class="card card-ts">
                    <span class="card-icon">&#128338;</span>
                    <span class="label">Timestamp</span>
                    <div class="accent-bar accent-c" style="margin-left:auto;margin-right:auto;"></div>
                    <p class="ts-text">${new Date().toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      timeZoneName: 'short'
                    })}</p>
                  </div>
                  <div class="quick-action">
                    <a href="mailto:${email}?subject=Re: ${subject}" class="reply-btn">&#9993; Reply to ${name}</a>
                  </div>
                </div>
                <div class="footer">
                  <p><span>&#9679;</span> portfolio notification system &mdash; subash-dev-portfolio.zeabur.app</p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      // Auto-reply HTML (cosmic dark theme, matching portfolio)
      const autoReplyHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Signal Received &mdash; Subash S</title>
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #050510; color: #e2e8f0; }
            .outer { background: linear-gradient(180deg, #050510 0%, #0a0a1f 50%, #050510 100%); padding: 40px 16px; }
            .wrapper { max-width: 620px; margin: 0 auto; }
            .container { background: linear-gradient(145deg, #0c0c20 0%, #0a0a18 100%); border-radius: 20px; overflow: hidden; border: 1px solid rgba(139,92,246,0.2); box-shadow: 0 0 80px rgba(139,92,246,0.08), 0 0 30px rgba(59,130,246,0.05), inset 0 1px 0 rgba(255,255,255,0.03); }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%); padding: 50px 36px 44px; text-align: center; position: relative; }
            .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); }
            .header-icon { font-size: 42px; margin-bottom: 12px; display: block; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3; text-shadow: 0 2px 20px rgba(0,0,0,0.3); }
            .header p { margin: 14px auto 0; font-size: 15px; color: rgba(255,255,255,0.88); max-width: 400px; line-height: 1.5; }
            .status-pill { display: inline-block; margin-top: 18px; padding: 6px 18px; border-radius: 100px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); font-size: 11px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 2.5px; text-transform: uppercase; color: #ffffff; border: 1px solid rgba(255,255,255,0.15); }
            .status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #4ade80; margin-right: 8px; box-shadow: 0 0 8px #4ade80; vertical-align: middle; }
            .content { padding: 36px 32px; }
            .greeting { font-size: 16px; color: rgba(255,255,255,0.7); margin: 0 0 28px 0; line-height: 1.6; }
            .greeting strong { color: #c4b5fd; }
            .card { background: linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(59,130,246,0.04) 100%); border: 1px solid rgba(139,92,246,0.12); border-radius: 14px; padding: 24px; margin: 16px 0; position: relative; overflow: hidden; }
            .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent); }
            .card-b { border-color: rgba(59,130,246,0.12); background: linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(6,182,212,0.04) 100%); }
            .card-b::before { background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent); }
            .card-c { border-color: rgba(6,182,212,0.12); background: linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(16,185,129,0.04) 100%); }
            .card-c::before { background: linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent); }
            .card-e { border-color: rgba(244,114,182,0.12); background: linear-gradient(135deg, rgba(244,114,182,0.06) 0%, rgba(139,92,246,0.04) 100%); }
            .card-e::before { background: linear-gradient(90deg, transparent, rgba(244,114,182,0.3), transparent); }
            .card-icon { font-size: 20px; margin-bottom: 6px; display: block; }
            .label { font-size: 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 12px; display: block; }
            .accent-bar { width: 50px; height: 3px; border-radius: 3px; margin-bottom: 16px; }
            .accent-v { background: linear-gradient(90deg, #8b5cf6, #a78bfa); box-shadow: 0 0 12px rgba(139,92,246,0.4); }
            .accent-b { background: linear-gradient(90deg, #3b82f6, #60a5fa); box-shadow: 0 0 12px rgba(59,130,246,0.4); }
            .accent-c { background: linear-gradient(90deg, #06b6d4, #22d3ee); box-shadow: 0 0 12px rgba(6,182,212,0.4); }
            .accent-e { background: linear-gradient(90deg, #f472b6, #e879f9); box-shadow: 0 0 12px rgba(244,114,182,0.4); }
            .card h3 { margin: 0 0 14px 0; font-size: 17px; font-weight: 700; }
            .t-v { color: #c4b5fd; }
            .t-b { color: #93c5fd; }
            .t-c { color: #67e8f9; }
            .t-e { color: #f9a8d4; }
            .card p { margin: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.65; }
            .card strong { color: rgba(255,255,255,0.85); }
            .msg-box { background: rgba(0,0,0,0.2); border: 1px solid rgba(59,130,246,0.08); border-radius: 10px; padding: 18px; margin-top: 12px; }
            .msg-text { color: rgba(255,255,255,0.6); line-height: 1.75; white-space: pre-line; font-size: 14px; margin: 0; }
            .cta-row { margin: 20px 0 0 0; text-align: center; }
            .cta-btn { display: inline-block; margin: 6px 5px; padding: 12px 26px; border-radius: 10px; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
            .cta-v { background: linear-gradient(135deg, #7c3aed, #6366f1); box-shadow: 0 4px 20px rgba(124,58,237,0.3); }
            .cta-b { background: linear-gradient(135deg, #2563eb, #3b82f6); box-shadow: 0 4px 20px rgba(37,99,235,0.3); }
            .cta-c { background: linear-gradient(135deg, #0891b2, #06b6d4); box-shadow: 0 4px 20px rgba(8,145,178,0.3); }
            .divider { border: none; height: 1px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.2), rgba(59,130,246,0.2), transparent); margin: 32px 0; }
            .closing { color: rgba(255,255,255,0.5); text-align: center; margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; }
            .footer { background: linear-gradient(180deg, rgba(9,9,26,0) 0%, #09091a 100%); padding: 32px 32px; text-align: center; border-top: 1px solid rgba(139,92,246,0.06); }
            .footer-name { font-size: 20px; font-weight: 800; margin: 0 0 4px 0; color: #c4b5fd; }
            .footer-role { margin: 0 0 4px 0; font-size: 13px; color: rgba(255,255,255,0.4); letter-spacing: 0.3px; }
            .footer-links { margin: 18px 0 0 0; }
            .footer-link { display: inline-block; margin: 4px 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(139,92,246,0.15); color: rgba(255,255,255,0.5); text-decoration: none; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; }
            .footer-note { font-size: 10px; color: rgba(255,255,255,0.2); margin-top: 20px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 1px; }
            .footer-note span { color: rgba(74,222,128,0.5); }
          </style>
        </head>
        <body>
          <div class="outer">
            <div class="wrapper">
              <div class="container">

                <div class="header">
                  <span class="header-icon">&#10024;</span>
                  <h1>Message Received<br>Successfully!</h1>
                  <p>Your transmission has landed in my inbox. I appreciate you reaching out.</p>
                  <div class="status-pill"><span class="status-dot"></span>Signal Locked</div>
                </div>

                <div class="content">
                  <p class="greeting">Hey there! &#128075; Thanks for connecting through my <strong>Cosmic AI Universe</strong> portfolio. Here's a summary of your message:</p>

                  <div class="card">
                    <span class="card-icon">&#128225;</span>
                    <span class="label">Transmission Log</span>
                    <div class="accent-bar accent-v"></div>
                    <h3 class="t-v">Message Summary</h3>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Received:</strong> ${new Date().toLocaleString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>

                  <div class="card card-b">
                    <span class="card-icon">&#128172;</span>
                    <span class="label">Message Contents</span>
                    <div class="accent-bar accent-b"></div>
                    <h3 class="t-b">Your Message</h3>
                    <div class="msg-box">
                      <p class="msg-text">${message.replace(/\n/g, '<br>')}</p>
                    </div>
                  </div>

                  <div class="card card-c">
                    <span class="card-icon">&#9889;</span>
                    <span class="label">Response ETA</span>
                    <div class="accent-bar accent-c"></div>
                    <h3 class="t-c">What Happens Next?</h3>
                    <p>I typically respond within <strong>24 hours</strong>. If it's urgent, feel free to ping me directly on LinkedIn or email.</p>
                  </div>

                  <div class="card card-e">
                    <span class="card-icon">&#127760;</span>
                    <span class="label">Connect Channels</span>
                    <div class="accent-bar accent-e"></div>
                    <h3 class="t-e">Let's Stay Connected</h3>
                    <p>While you wait, feel free to explore my work or reach out through:</p>
                    <div class="cta-row">
                      <a href="https://www.linkedin.com/in/subash-s-514aa9373" target="_blank" class="cta-btn cta-v">&#128188; LinkedIn</a>
                      <a href="https://github.com/Subash-S-66" target="_blank" class="cta-btn cta-b">&#128187; GitHub</a>
                      <a href="mailto:${process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'}" class="cta-btn cta-c">&#9993; Email</a>
                    </div>
                  </div>

                  <hr class="divider">
                  <p class="closing">Looking forward to connecting with you! &#129309;</p>
                </div>

                <div class="footer">
                  <p class="footer-name">&#10024; Subash S</p>
                  <p class="footer-role">Full-Stack Developer &bull; MERN + AI</p>
                  <p class="footer-role">Dr. M.G.R. Educational and Research Institute, Chennai</p>
                  <div class="footer-links">
                    <a href="https://subash-dev-portfolio.zeabur.app" target="_blank" class="footer-link">&#127760; Portfolio</a>
                    <a href="https://github.com/Subash-S-66" target="_blank" class="footer-link">&#128187; GitHub</a>
                    <a href="https://www.linkedin.com/in/subash-s-514aa9373" target="_blank" class="footer-link">&#128188; LinkedIn</a>
                  </div>
                  <p class="footer-note"><span>&#9679;</span> automated response &mdash; this email was generated by my portfolio system</p>
                </div>

              </div>
            </div>
          </div>
        </body>
        </html>
      `

      // Where to send the admin notification
      const notificationEmail = process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'

      // Send notification to admin using SMTP if configured, otherwise try Resend
      if (usingSMTP) {
        // Send notification to admin
        await sendEmailWithSMTP(notificationEmail, `Portfolio Contact: ${subject}`, mainEmailHtml, email)
        // Send auto-reply to sender via SMTP (not third-party)
        try {
          await sendEmailWithSMTP(email, `Thank you for contacting me - ${subject}`, autoReplyHtml, notificationEmail)
        } catch (err) {
          console.warn('Auto-reply failed (SMTP):', err.message)
        }
      } else if (process.env.RESEND_API_KEY) {
        // Send notification via Resend (only admin, no auto-reply to avoid third-party for sender)
        await sendEmailWithResend(notificationEmail, `Portfolio Contact: ${subject}`, mainEmailHtml, email)
        console.log('Auto-reply not sent to sender (Resend is third-party service)')
      } else {
        console.log('No email service configured. Message received but not sent via email.')
        console.log('Name:', name, 'Email:', email, 'Subject:', subject, 'Message:', message)
      }

      res.json({
        success: true,
        message: 'Message received! I\'ll get back to you soon.'
      })

    } catch (error) {
      console.error('Contact form error:', error.message)
      
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      })
    }
  }
)

// Portfolio data endpoint
app.get('/api/portfolio', (req, res) => {
  const portfolioData = {
    personal: {
      name: 'Subash S',
      title: 'B.Tech Computer Science Student',
      subtitle: 'Full Stack Developer using MERN Stack',
      email: 'your-email@gmail.com',
      phone: '+91-9345081127',
      location: 'Chennai, India',
      github: 'https://github.com/Subash-S-66',
      linkedin: 'https://www.linkedin.com/in/subash-s-514aa9373'
    },
    about: {
      summary: 'Computer Science Engineering student with practical experience in full-stack web development, focusing on the MERN stack (using MySQL instead of MongoDB). Currently doing an internship at Postulate Info Tech, contributing to real-world projects.',
      cgpa: '7.7/10',
      university: 'Dr.M.G.R. Educational and Research Institute, Chennai',
      graduationYear: '2022-2026'
    },
    skills: {
      programming: ['JavaScript', 'Python'],
      frontend: ['React.js', 'Node.js', 'Express.js', 'HTML', 'CSS', 'Tailwind CSS'],
      database: ['MySQL','PostgreSQL','MongoDB'],
      tools: ['Git', 'GitHub'],
      softSkills: ['Problem Solving', 'Teamwork', 'Communication']
    },
    languages: [
      { name: 'English', level: 'Fluent' },
      { name: 'Tamil', level: 'Fluent' },
      { name: 'Hindi', level: 'Basics' }
    ]
  }

  res.json(portfolioData)
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  })
})

// Serve static files from the React app build directory (relative to this file)
app.use(express.static(path.join(__dirname, 'dist')))
// Also serve the same build when the app is hosted under a subpath (Zeabur uses /projects)
app.use('/projects', express.static(path.join(__dirname, 'dist')))
// Serve Android APK files from the root-level "Android app" folder
app.use('/apk', express.static(path.join(__dirname, '..', 'Android app')))
app.use('/projects/apk', express.static(path.join(__dirname, '..', 'Android app')))

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  // If the request starts with the Zeabur subpath, ensure we return the built index
  // so relative asset links resolve under /projects/* correctly.
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
