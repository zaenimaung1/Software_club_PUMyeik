import { Router } from 'express'
import {
  listKnowledge,
  createKnowledgeItem,
  updateKnowledgeItem,
  deleteKnowledgeItem,
} from '../controllers/knowledgeController.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', listKnowledge)
router.post('/', protect, requireRole('admin'), createKnowledgeItem)
router.patch('/:id', protect, requireRole('admin'), updateKnowledgeItem)
router.delete('/:id', protect, requireRole('admin'), deleteKnowledgeItem)

export default router
