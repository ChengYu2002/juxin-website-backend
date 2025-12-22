const createInquiry = (req, res) => {
    const { name, email, message } = req.body || {};
    return res.status(201).json({ ok: true, name, email, message });
}

module.exports = { createInquiry }