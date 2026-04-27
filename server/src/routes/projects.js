import { Router } from 'express'
import {
  addProjectComment,
  createProject,
  deleteProject,
  listAdminProjects,
  listApprovedProjects,
  listMyProjects,
  reviewProject,
  toggleProjectLike,
} from '../controllers/projectController.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', listApprovedProjects)
router.get('/mine', protect, listMyProjects)
router.post('/', protect, requireRole(['member', 'admin']), createProject)
router.post('/:id/like', protect, requireRole(['member', 'admin']), toggleProjectLike)
router.post('/:id/comments', protect, requireRole(['member', 'admin']), addProjectComment)
router.get('/admin/all', protect, requireRole('admin'), listAdminProjects)
router.patch('/:id/review', protect, requireRole('admin'), reviewProject)
router.delete('/:id', protect, requireRole('admin'), deleteProject)

export default router
