// src/controllers/inquiryController.js
// 作用：处理 POST /inquiry 的业务逻辑：发邮件、返回结果。

const { sendInquiryMail } = require('../services/mailer')
const { getGeoByIp } = require('../services/geo')

/**
   * ✅ 发邮件（核心功能）
   * - 重要策略：邮件失败 ≠ 提交失败
   *   因为 SMTP 配置/网络偶发问题不能让客户看到“提交失败”（否则体验很差）
   * - 我们通过 emailed 字段告诉前端/日志：邮件到底成功了没
   */

async function createInquiry(req, res) {
  const { name, email, message } = req.body
  const { ip } = req.clientMeta
  // console.log('🔥 inquiry:', { ip, userAgent, name, email })

  // geo 可选：失败不影响
  const geo = (await getGeoByIp(ip)) || {}
  const { country, region } = geo

  let emailSent = true
  try {
    await sendInquiryMail({ name, email, message, country, region })
  } catch (err) {
    console.error('❌ Failed to send inquiry email:', err?.message || err)
    emailSent = false
  }

  // 返回结果
  return res.status(200).json({
    ok: true,
    emailSent
  })

}

module.exports = { createInquiry }