// src/routes/adminAuth.js
// 作用：管理员认证相关路由

const router = require('express').Router()
const jwt = require('jsonwebtoken')

router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'account or password required' })
  }

  const ok =
    username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD

  if (!ok) {
    return res.status(401).json({ ok: false, message:  'invalid credentials' })
  }

  const payload = { username: process.env.ADMIN_USERNAME, role: 'admin' }

  const token = jwt.sign(payload, process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d', }
  )

  return res.json({ ok: true, token })
})

module.exports = router

