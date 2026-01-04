// routes/products.js
const productsRouter = require('express').Router()
const productController = require('../controllers/productController')
const { requireAdmin } = require('../middleware/requireAdmin')

// public
productsRouter.get('/', productController.getProducts)
productsRouter.get('/:idorSlug', productController.getProductByIdorSlug)

// admin only
productsRouter.post('/', requireAdmin, productController.createProduct)
productsRouter.put('/:id', requireAdmin, productController.updateProduct)
productsRouter.delete('/:id', requireAdmin, productController.deleteProduct)

module.exports = productsRouter