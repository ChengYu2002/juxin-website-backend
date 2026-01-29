// controllers/productController.js
// 作用：处理 product 的业务逻辑：返回结果、数据操作、CRUD。
const Product = require('../models/product')
const { deleteBatchByUrls } = require('./uploadController')

/**
 * =========================
 * PUBLIC
 * =========================
 */

// public：只返回上架产品
// GET /api/products?category=shopping-trolley

const getPublicProducts = async (req, res, next) => {
  try {
    const { category } = req.query
    const filter = { isActive: true }

    if (category) {
      filter.category = category
    }

    const products = await Product.find(filter).sort({ sortOrder: -1, createdAt: -1 })
    res.json(products)

  } catch (error) {
    next(error)
  }
}


// public：按 id 或 slug 获取单个产品 (下架商品不允许看到)
// GET /api/products/:idorSlug
const getPublicProductByIdorSlug = async (req, res, next) => {
  try {
    // 从 URL 参数中获取 id 或 slug, {}: 解构赋值重命名
    const { idorSlug }  = req.params

    // 先按业务 id 查（JX-25ZP）
    let product = await Product.findOne({ id: idorSlug })
    // 如果没找到，再按 slug 查（jx-25zp）
    if (!product) {
      product = await Product.findOne({ slug: idorSlug })
    }
    // 仍然没找到，返回 404
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' })
    }

    // ❗ public 访问不允许看到下架产品
    if (!product.isActive) {
      return res.status(404).json({ ok: false, error: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
}

/**
 * =========================
 * ADMIN
 * =========================
 */

// admin：返回所有产品（可选过滤）
// GET /api/products/admin?category=...&isActive=true/false
const getAdminProducts = async (req, res, next) => {
  try {
    const { category, isActive } = req.query
    const filter = {}

    if (typeof isActive !== 'undefined') {  // 确认 isActive 这个变量“真的存在”
      filter.isActive = isActive === 'true' // string转换为bool (防御式编程)
    }

    if (category) {
      filter.category = category
    }

    const products = await Product.find(filter)
      .sort({ sortOrder: -1, updatedAt: -1 })

    res.json(products)
  } catch (error) {
    next(error)
  }
}

// admin：按 id 或 slug 获取单个产品 (所有商品都能看到)
// GET /api/products/admin/:idorSlug (admin only)
const getAmdinProductByIdorSlug = async (req, res, next) => {
  try {
    // 从 URL 参数中获取 id 或 slug, {}: 解构赋值重命名
    const { idorSlug }  = req.params

    // 先按业务 id 查（JX-25ZP）
    let product = await Product.findOne({ id: idorSlug })
    // 如果没找到，再按 slug 查（jx-25zp）
    if (!product) {
      product = await Product.findOne({ slug: idorSlug })
    }
    // 仍然没找到，返回 404
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
}

// 新建产品（管理员用）
// POST /api/products (admin only)
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body
    const created = await Product.create(productData)
    res.status(201).json(created)

  } catch (error) {
    // slug/id unique 冲突常见：E11000 duplicate key
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]
      const value = error.keyValue?.[field]

      return res.status(409).json({
        ok: false,
        field,
        value,
        error: `${field} already exists`
      })
    }

    next(error)
  }
}

// 更新产品（管理员用）（⚠️ 使用业务 id）
// PUT /api/products/:id (admin only)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const body = req.body

    const updated = await Product.findOneAndUpdate(
      { id }, // 查询条件：业务 id（JX-L5）
      body,   // 更新内容
      { new: true, runValidators: true } // 选项：返回更新后的文档，运行验证
    )

    if (!updated) {
      return res.status(404).json({ ok: false, error: 'Product not found' })
    }
    res.json(updated)
  } catch (error) {
    // slug/id unique 冲突常见：E11000 duplicate key
    if (error && error.code === 11000) {
      return res.status(409).json({ ok: false, error: 'Product id or slug already exists' })
    }

    next(error)
  }
}

// admin：删除产品（⚠️ 使用业务 id）
// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params

    // ① 先查 product（不能直接 delete，不然图片 key 丢了）
    const product = await Product.findOne({ id })

    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' })
    }

    // set: 去重图片 URL
    const urlSet = new Set()
    for (const variant of product.variants || []) {
      for (const imgUrl of variant.images || []) {
        const u = (imgUrl && String(imgUrl).trim()) || ''
        if (u) urlSet.add(u)
      }
    }

    const urls = [...urlSet]


    // ✅ OSS best-effort：失败不 throw
    if (urls.length > 0) {
      try {
        await deleteBatchByUrls(urls)
      } catch (err) {
        // 这里不要 next(err)
        // 只记录日志（用你自己的 logger）
        console.warn('[deleteProduct] deleteBatchByUrls failed:', err?.message || err)
      }
    }

    // ✅ 再删 DB
    await product.deleteOne()

    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

// admin：删除产品variant（⚠️ 使用业务 variant key）
// DELETE /admin/products/:id/variants/:key (admin only)
const deleteProductVariant = async (req, res, next) => {
  try {
    const { id, key } = req.params

    // ① 查 product
    const product = await Product.findOne({ id })
    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found' })
    }

    // ② 找 variant
    const idx = product.variants.findIndex(v => v.key === key)

    if (idx === -1) { // 没找到
      return res.status(404).json({ ok: false, error: 'Variant not found' })
    }

    const variant = product.variants[idx]

    // ③ 批量删除 OSS 图片（群删 ⭐）
    if (variant.images?.length > 0) {
      await deleteBatchByUrls(variant.images)
    }

    // ④ 从数组移除
    product.variants.splice(idx, 1)

    // ⑤ 保存（触发 schema validator，包括你刚加的 unique 校验）
    await product.save()

    return res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}


module.exports = {
  getPublicProducts,
  getPublicProductByIdorSlug,
  getAdminProducts,
  getAmdinProductByIdorSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductVariant,
}