// src/services/mailer.js (CommonJS)
// 作用：把“发邮件”这件事封装成一个函数，controller 里只调用即可。
// 好处：业务逻辑（controller）不会被 SMTP 配置细节污染。
const nodemailer = require('nodemailer')

// transporter = “邮局通道”
// 这里用公司邮箱的 SMTP 来发信（系统通知邮件）
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                  // 公司邮箱提供的 SMTP 域名
  port: Number(process.env.SMTP_PORT),          // 常见 465 或 587
  secure: process.env.SMTP_SECURE === 'true',   // 465 => true, 587 => false
  auth: {
    user: process.env.SMTP_USER,                // 发件账号（一般就是公司邮箱）
    pass: process.env.SMTP_PASS,                // SMTP 授权码
  },
  connectionTimeout: 20_000,
  greetingTimeout: 20_000,
  socketTimeout: 20_000,
})

async function sendInquiryMail(payload) {
  // 邮件主题：方便你在收件箱里一眼看到是谁来的询盘
  const subject = `[New Inquiry] ${payload?.name || 'Anonymous'} | Juxin Website`
  // 邮件正文
  const body = ['You have received a new inquiry from the Juxin website.',
    '',
    '==============================',
    'Buyer Information',
    '==============================',
    `Name   : ${payload?.name || '-'}`,
    `Email  : ${payload?.email || '-'}`,
    `Country: ${payload?.country || '-'}`,
    `Region : ${payload?.region || '-'}`,
    '',
    '==============================',
    'Inquiry Message',
    '==============================',
    payload?.message || '-',
    '',
    '==============================',
    `Submitted at (Beijing Time 北京时间): ${new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      hour12: false,
    })}`,
    '',
    'This is an automated notification from the Juxin website.',
    'Please reply directly to this email to contact the buyer.',
  ].join('\n')

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject,
    text: body,
    replyTo: payload?.email ? String(payload.email).trim() : undefined,
  })
}

module.exports = { sendInquiryMail }


