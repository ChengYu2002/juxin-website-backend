// src/routes/inquiry.js
// 作用：inquiry 相关路由

const router = require('express').Router()
const { createInquiry } = require('../controllers/inquiryController')
const { validateInquiry, dedupeInquiry } = require('../middleware/inquiryValidation')
const { getClientMeta } = require('../utils/clientMeta')


router.post('/',
  (req, res, next) => {
    // 获取客户端元信息（IP、User-Agent 等）
    req.clientMeta = getClientMeta(req)
    next()
  },
  validateInquiry,  // 校验请求数据
  dedupeInquiry,    // 防重复提交
  createInquiry     // 真正业务逻辑
)

router.get('/', (req, res) => {
  res.send('Inquiry endpoint is alive')
})

module.exports = router