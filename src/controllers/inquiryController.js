const createInquiry = async(req, res) => {
  console.log('🔥 received body:', req.body)
  const { name, email, message } = req.body || {}
  return res.status(201).json({ ok: true, name, email, message })



}

module.exports = { createInquiry }