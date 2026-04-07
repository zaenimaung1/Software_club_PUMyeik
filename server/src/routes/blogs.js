import { Router } from 'express'
import {
  listBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
} from '../controllers/blogController.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', listBlogs)
router.post('/', protect, requireRole('admin'), createBlog)
router.patch('/:id', protect, requireRole('admin'), updateBlog)
router.delete('/:id', protect, requireRole('admin'), deleteBlog)
router.post('/:id/like', protect, requireRole(['member', 'admin']), toggleLike)
router.post('/:id/comments', protect, requireRole(['member', 'admin']), addComment)

export default router
