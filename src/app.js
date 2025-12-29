//src/app.js
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const inquiryRouter = require('./routes/inquiry')
const { requestLogger } = require('./middleware/requestLogger')
const { unknownEndpoint } = require('./middleware/unknownEndpoint')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

/**
 * ✅ trust proxy
 * 如果以后部署到 Nginx/Cloudflare/Render/Heroku 等反向代理后面，
 * 需要这句才能正确识别真实 IP（req.ip / x-forwarded-for）
 */
app.set('trust proxy', 1)

// helmet：给 Express 默认把“安全门窗”关好，防一些常见的低级攻击
app.use(helmet())

if (process.env.NODE_ENV !== 'production') {
  app.use(cors()) // 仅开发联调用
  // 后续版本可以用白名单形式的 cors 配置
}

// 静态文件中间件，托管前端打包后的静态资源
app.use(express.static('dist'))

// json 解析中间件
app.use(express.json({ limit: '20kb' })) // 限制请求体大小，防止大包打爆内存

// 请求日志中间件（开发环境下启用）
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger)
}

// 应用限速中间件到 /api/inquiry 路由
// 也可以放在router/inquiry.js里模块化
app.use('/api/inquiry', inquiryRouter)

// 404 处理中间件: unknown endpoint
app.use(unknownEndpoint)

// 错误处理中间件（必须放在所有路由之后）: error handler
app.use(errorHandler)

module.exports = app