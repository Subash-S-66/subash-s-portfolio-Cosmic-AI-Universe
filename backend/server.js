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
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #08080f; }
            .wrapper { max-width: 650px; margin: 0 auto; padding: 20px; }
            .container { background-color: #0e0e1a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(59,130,246,0.15); box-shadow: 0 0 40px rgba(139,92,246,0.06); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 32px 30px; text-align: center; }
            .header h2 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
            .header p { margin: 10px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.8); }
            .header .mono-tag { display: inline-block; margin-top: 14px; padding: 4px 14px; border-radius: 20px; background: rgba(255,255,255,0.12); font-size: 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.75); }
            .content { padding: 30px; }
            .card { background-color: #13132a; border: 1px solid rgba(59,130,246,0.12); border-radius: 12px; padding: 22px; margin: 16px 0; }
            .card h3 { margin: 0 0 14px 0; color: #60a5fa; font-size: 16px; font-weight: 600; }
            .card p { margin: 7px 0; color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.5; }
            .card strong { color: rgba(255,255,255,0.8); }
            .card a { color: #60a5fa; text-decoration: none; }
            .card .label { font-size: 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 10px; display: block; }
            .accent-line { width: 30px; height: 2px; background: linear-gradient(90deg, #3b82f6, #06b6d4); border-radius: 2px; margin-bottom: 14px; }
            .msg-card { background-color: #13132a; border: 1px solid rgba(139,92,246,0.12); border-radius: 12px; padding: 22px; margin: 16px 0; }
            .msg-card h3 { margin: 0 0 14px 0; color: #a78bfa; font-size: 16px; font-weight: 600; }
            .msg-card .label { font-size: 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 10px; display: block; }
            .msg-card .accent-line { background: linear-gradient(90deg, #8b5cf6, #a855f7); }
            .message-text { color: rgba(255,255,255,0.55); line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
            .ts-card { background-color: #13132a; border: 1px solid rgba(6,182,212,0.12); border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center; }
            .ts-card p { margin: 0; color: #22d3ee; font-size: 12px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 0.5px; }
            .footer { background-color: #09091a; padding: 20px; text-align: center; border-top: 1px solid rgba(59,130,246,0.08); }
            .footer p { margin: 0; font-size: 11px; color: rgba(255,255,255,0.25); font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h2>New Contact Form Submission</h2>
                <p>You have received a new message from your portfolio</p>
                <span class="mono-tag">Incoming Signal</span>
              </div>
              <div class="content">
                <div class="card">
                  <span class="label">Sender Details</span>
                  <div class="accent-line"></div>
                  <h3>Contact Information</h3>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                  <p><strong>Subject:</strong> ${subject}</p>
                </div>
                <div class="msg-card">
                  <span class="label">Message Contents</span>
                  <div class="accent-line"></div>
                  <h3>Message</h3>
                  <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="ts-card">
                  <p><strong>Received:</strong> ${new Date().toLocaleString('en-US', {
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
              </div>
              <div class="footer">
                <p>// portfolio contact form notification</p>
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
          <title>Thank you for contacting Subash</title>
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #08080f; }
            .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #0e0e1a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(139,92,246,0.15); box-shadow: 0 0 50px rgba(139,92,246,0.06); }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%); padding: 44px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }
            .header p { margin: 12px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.85); letter-spacing: 0.3px; }
            .header .mono-tag { display: inline-block; margin-top: 16px; padding: 4px 14px; border-radius: 20px; background: rgba(255,255,255,0.12); font-size: 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.8); }
            .content { padding: 36px 30px; }
            .card { background-color: #13132a; border: 1px solid rgba(139,92,246,0.12); border-radius: 12px; padding: 22px; margin: 18px 0; }
            .card h3, .card h4 { margin: 0 0 12px 0; font-size: 15px; font-weight: 600; }
            .card-violet h3, .card-violet h4 { color: #a78bfa; }
            .card-blue h3, .card-blue h4 { color: #60a5fa; }
            .card-cyan h3, .card-cyan h4 { color: #22d3ee; }
            .card p { margin: 6px 0; color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; }
            .card strong { color: rgba(255,255,255,0.8); }
            .card .label { font-size: 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 10px; display: block; }
            .message-text { color: rgba(255,255,255,0.55); line-height: 1.7; white-space: pre-line; font-size: 14px; }
            .accent-line { width: 40px; height: 2px; border-radius: 2px; margin-bottom: 14px; }
            .accent-violet { background: linear-gradient(90deg, #8b5cf6, #a855f7); }
            .accent-blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
            .accent-cyan { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
            .contact-links { margin: 16px 0 0 0; }
            .contact-links a { display: inline-block; margin: 5px 8px 5px 0; padding: 10px 20px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; }
            .divider { border: none; border-top: 1px solid rgba(139,92,246,0.1); margin: 28px 0; }
            .closing { color: rgba(255,255,255,0.5); text-align: center; margin: 24px 0 8px 0; font-size: 14px; }
            .footer { background-color: #09091a; padding: 28px 30px; text-align: center; border-top: 1px solid rgba(139,92,246,0.08); }
            .footer .name { font-size: 16px; font-weight: 600; background: linear-gradient(90deg, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 6px 0; }
            .footer .role { margin: 0 0 4px 0; font-size: 13px; color: rgba(255,255,255,0.45); }
            .footer .social-links { margin: 14px 0; }
            .footer .social-links a { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 13px; margin: 0 6px; }
            .footer .social-links .sep { color: rgba(255,255,255,0.15); margin: 0 4px; }
            .footer .auto-note { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 16px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>Thank You for Reaching Out!</h1>
                <p>I've received your message and appreciate you taking the time to connect.</p>
                <span class="mono-tag">Signal Received</span>
              </div>

              <div class="content">
                <div class="card card-violet">
                  <span class="label">Transmission Log</span>
                  <div class="accent-line accent-violet"></div>
                  <h3>Message Summary</h3>
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

                <div class="card card-blue">
                  <span class="label">Message Contents</span>
                  <div class="accent-line accent-blue"></div>
                  <h4>Your Message</h4>
                  <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
                </div>

                <div class="card card-cyan">
                  <span class="label">Response ETA</span>
                  <div class="accent-line accent-cyan"></div>
                  <h4>Response Time</h4>
                  <p>I typically respond to all messages within 24-48 hours. For urgent inquiries, feel free to follow up on this email.</p>
                </div>

                <div class="card card-violet">
                  <span class="label">Alternate Channels</span>
                  <div class="accent-line accent-violet"></div>
                  <h4>Alternative Ways to Connect</h4>
                  <p>While you wait for my response, you can also reach me through:</p>
                  <div class="contact-links">
                    <a href="https://www.linkedin.com/in/subash-s-514aa9373" target="_blank">LinkedIn</a>
                    <a href="https://github.com/Subash-S-66" target="_blank">GitHub</a>
                    <a href="mailto:${process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'}">Direct Email</a>
                  </div>
                </div>

                <hr class="divider">

                <p class="closing">Looking forward to connecting with you soon!</p>
              </div>

              <div class="footer">
                <p class="name">Subash S</p>
                <p class="role">Full Stack Developer &bull; B.Tech Computer Science</p>
                <p class="role">Dr. M.G.R. Educational and Research Institute, Chennai</p>
                <div class="social-links">
                  <a href="https://github.com/Subash-S-66" target="_blank">GitHub</a>
                  <span class="sep">&bull;</span>
                  <a href="https://www.linkedin.com/in/subash-s-514aa9373" target="_blank">LinkedIn</a>
                  <span class="sep">&bull;</span>
                  <a href="mailto:${process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'}">Email</a>
                </div>
                <p class="auto-note">// automated response &mdash; do not reply directly</p>
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
