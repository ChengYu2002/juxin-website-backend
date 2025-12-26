// src/middleware/inquiryProtection.js

// 路由级防刷：slowDown + rateLimit（只对 /api/inquiry 生效）
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')

/**
 * ✅ slowDown（减速）
 * - 解决：刷子一秒几十次打你接口
 * - 做法：超过阈值开始“逐渐变慢”，让刷子成本升高
 */
const inquirySpeedLimiter = slowDown({
  windowMs: 10 * 60 * 1000, // 10 minutes
  delayAfter: 3,            // allow 3 requests per 10 minutes, then...
  delayMs: () => 800,       // begin adding 800ms of delay per request above 3:
})

/**
 * ✅ rateLimit（限流）
 * - 解决：刷子一秒几十次打你接口
 * - 做法：达到上限直接 429
*/
const inquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5,                // limit each IP to 5 requests per windowMs
  standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers “我按现代规范说话”
  legacyHeaders: false,     // Disable the `X-RateLimit-*` headers “我不再照顾老旧客户端”
  message: {
    ok: false,
    error: 'Too many inquiries created from this IP, please try again later.'
  }
})

module.exports = { inquirySpeedLimiter, inquiryLimiter }
