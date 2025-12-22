const router = require('express').Router();
const { createInquiry } = require('../controllers/inquiryController');

router.post('/', createInquiry);

router.get('/', (req, res) => {
    res.send('Inquiry endpoint is alive');
  });

module.exports = router;