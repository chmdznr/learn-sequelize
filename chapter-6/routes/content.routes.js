const express = require('express');
const router = express.Router();
const { Content, Article, Video } = require('../models');

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Get all content
 *     parameters:
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *         description: Include soft deleted content
 *     responses:
 *       200:
 *         description: List of content items
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const content = await Content.findAll({
      paranoid: !includeDeleted
    });
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get content by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Content item
 *       404:
 *         description: Content not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const content = await Content.findByPk(req.params.id, {
      paranoid: !includeDeleted
    });
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/content/type/{type}:
 *   get:
 *     summary: Get content by type
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [article, video]
 *     responses:
 *       200:
 *         description: List of content items of specified type
 *       500:
 *         description: Internal server error
 */
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const content = await Content.findAll({
      where: { type }
    });
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create new content
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [article, video]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 description: Required for videos only
 *               url:
 *                 type: string
 *                 description: Required for videos only
 *     responses:
 *       201:
 *         description: Created content item
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  try {
    const { type, ...contentData } = req.body;
    let content;
    
    if (type === 'article') {
      content = await Article.create({ ...contentData, type });
    } else if (type === 'video') {
      content = await Video.create({ ...contentData, type });
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }
    
    res.status(201).json(content);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/content/articles:
 *   post:
 *     summary: Create new article (legacy endpoint)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created article
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/articles', async (req, res) => {
  try {
    const article = await Article.create({
      ...req.body,
      type: 'article'
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/content/videos:
 *   post:
 *     summary: Create new video (legacy endpoint)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - url
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created video
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/videos', async (req, res) => {
  try {
    const { title, url, duration } = req.body;
    if (!title || !url || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const video = await Video.create({
      ...req.body,
      type: 'video'
    });
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete content (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       404:
 *         description: Content not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    await content.destroy();
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/content/{id}/force:
 *   delete:
 *     summary: Hard delete content (for admin use)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Content permanently deleted
 *       404:
 *         description: Content not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/force', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id, { paranoid: false });
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    await content.destroy({ force: true });
    res.json({ message: 'Content permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/content/{id}/restore:
 *   post:
 *     summary: Restore soft-deleted content
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Content restored
 *       404:
 *         description: Content not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/restore', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id, { paranoid: false });
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    await content.restore();
    const restoredContent = await Content.findByPk(content.id);
    res.json(restoredContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
