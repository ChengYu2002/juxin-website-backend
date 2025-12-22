const express = require('express')
const cors = require('cors')
const inquiryRouter = require('./routes/inquiry')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  // res.send({ status: 'ok' })
  res.send('Welcome to Juxin Website Backend!')
})

app.use('/api/inquiry', inquiryRouter)

module.exports = app