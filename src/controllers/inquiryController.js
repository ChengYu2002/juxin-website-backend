// src/controllers/inquiryController.js
// 作用：处理 inquiry 的业务逻辑：发邮件、返回结果、数据操作、CRUD。

const { sendInquiryMail } = require('../services/mailer')
const { getGeoByIp } = require('../services/geo')
const Inquiry = require('../models/inquiry')

/**
   * ✅ 发邮件（核心功能）
   * - 重要策略：邮件失败 ≠ 提交失败
   *   因为 SMTP 配置/网络偶发问题不能让客户看到“提交失败”（否则体验很差）
   * - 我们通过 emailed 字段告诉前端/日志：邮件到底成功了没
   */

// 创建新的 inquiry
async function createInquiry(req, res, next) {
  try {
    const { name, email, message } = req.body
    const { ip } = req.clientMeta

    // geo 可选：失败不影响
    let country, region
    try {
      const geo = await getGeoByIp(ip)
      country = geo?.country
      region = geo?.region
    } catch {
      // ignore geo errors
    }

    // 邮件失败 ≠ 提交失败
    let emailSent = true
    try {
      await sendInquiryMail({ name, email, message, country, region })
    } catch (err) {
      console.error('❌ Failed to send inquiry email:', err?.message || err)
      emailSent = false
    }

    // 保存到数据库, 邮件失败也保存（询盘不能丢）
    const inquiry = await Inquiry.create({ //.create 一步完成：new document, schema 校验, save
      name,
      email,
      message,
      ip,
      emailed: emailSent,
      country,
      region,
    })

    return res.status(201).json({
      ok: true,
      id: inquiry.id,
      emailSent,
    })

  } catch (err) {
    return next(err)
  }
}

// 获取所有 inquiry 列表（管理员用）
async function getAllInquiries(req, res, next) {
  try {
    // 按创建时间倒序返回
    const inquiries = await Inquiry
      .find({})
      .sort({ createdAt: -1 })

    return res.json(inquiries)
  } catch (err) {
    return next(err)
  }
}

// 删除某个 inquiry（管理员用）
async function deleteInquiry(req, res, next) {
  try {
    const inquiryId = req.params.id
    const inquiry = await Inquiry.findByIdAndDelete(inquiryId)

    if (!inquiry) {
      return res.status(404).json({ error: 'inquiry not found' })
    }
    return res.status(204).end()
  } catch (err) {
    return next(err)
  }
}

module.exports = { createInquiry, getAllInquiries, deleteInquiry }