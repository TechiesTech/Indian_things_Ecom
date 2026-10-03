const express = require('express');
const router = express.Router();
const {
  getVendorProfile,
  getAllVendors,
  updateVendorStatus,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Vendor
 *   description: Vendor management routes (admin-facing and public profile)
 */

/**
 * @swagger
 * /api/vendor/profile/{id}:
 *   get:
 *     summary: Get vendor public profile (approved vendors only)
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor profile returned
 *       403:
 *         description: Vendor account not yet approved
 *       404:
 *         description: Vendor not found
 */
router.get('/profile/:id', getVendorProfile);

/**
 * @swagger
 * /api/vendor/all:
 *   get:
 *     summary: Admin – get all vendors
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all vendors
 *       401:
 *         description: Not authorized
 */
router.get('/all', protect, getAllVendors);

/**
 * @swagger
 * /api/vendor/approve/{id}:
 *   patch:
 *     summary: Admin – approve or reject a vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Vendor status updated
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Vendor not found
 */
router.patch('/approve/:id', protect, updateVendorStatus);

module.exports = router;
