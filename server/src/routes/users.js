import { Router } from 'express'
import {
  getUserStats,
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  listMembers,
  createMember,
  updateMember,
  deleteMember,
  updateMyProfile,
} from '../controllers/userController.js'
import { protect, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/stats', getUserStats)
router.patch('/me', protect, updateMyProfile)

router.use(protect, requireRole('admin'))

router.get('/admins', listAdmins)
router.post('/admins', createAdmin)
router.patch('/admins/:id', updateAdmin)
router.delete('/admins/:id', deleteAdmin)

router.get('/members', listMembers)
router.post('/members', createMember)
router.patch('/members/:id', updateMember)
router.delete('/members/:id', deleteMember)

export default router

