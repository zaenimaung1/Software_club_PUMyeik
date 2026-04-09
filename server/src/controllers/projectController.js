import Project from '../models/Project.js'

function sanitizeImages(images) {
  return Array.isArray(images)
    ? images.map((image) => String(image ?? '').trim()).filter(Boolean)
    : []
}

function projectQuery() {
  return Project.find()
    .populate('submitter', 'name email batch photo')
    .populate('reviewedBy', 'name email')
    .populate('likes', 'name')
    .populate('comments.user', 'name')
    .populate('comments.replies.user', 'name')
}

export async function listApprovedProjects(req, res) {
  const items = await projectQuery().where({ status: 'approved' }).sort({ createdAt: -1 })
  res.json(items)
}

export async function toggleProjectLike(req, res) {
  const project = await Project.findById(req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found' })

  const userId = req.user._id.toString()
  const hasLiked = project.likes.map((id) => id.toString()).includes(userId)

  if (hasLiked) {
    project.likes = project.likes.filter((id) => id.toString() !== userId)
  } else {
    project.likes.push(req.user._id)
  }

  await project.save()
  res.json({ likes: project.likes.length, hasLiked: !hasLiked })
}

export async function listMyProjects(req, res) {
  const items = await projectQuery()
    .where({ submitter: req.user._id })
    .sort({ createdAt: -1 })
  res.json(items)
}

export async function createProject(req, res) {
  const title = String(req.body.title ?? '').trim()
  const description = String(req.body.description ?? '').trim()
  const images = sanitizeImages(req.body.images)

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' })
  }

  if (images.length < 3) {
    return res.status(400).json({ message: 'Please upload at least 3 images' })
  }

  const item = await Project.create({
    title,
    description,
    images,
    submitter: req.user._id,
  })

  const populated = await Project.findById(item._id)
    .populate('submitter', 'name email batch photo')
    .populate('reviewedBy', 'name email')

  res.status(201).json(populated)
}

export async function listAdminProjects(req, res) {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
  const search = (req.query.search || '').trim()

  let query = projectQuery().sort({ createdAt: -1 })
  if (search) {
    query = query.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'submitter.name': { $regex: search, $options: 'i' } },
        { 'submitter.email': { $regex: search, $options: 'i' } },
      ]
    })
  }

  const items = await query.skip(skip).limit(limit).exec()
  const total = await projectQuery().countDocuments().exec()

  res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  })
}

export async function reviewProject(req, res) {
  const item = await Project.findById(req.params.id)
  if (!item) {
    return res.status(404).json({ message: 'Project not found' })
  }

  const status = String(req.body.status ?? '').trim().toLowerCase()
  const reviewNote = String(req.body.reviewNote ?? '').trim()

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' })
  }

  item.status = status
  item.reviewNote = reviewNote
  item.reviewedBy = req.user._id
  item.reviewedAt = new Date()
  await item.save()

  const populated = await Project.findById(item._id)
    .populate('submitter', 'name email batch photo')
    .populate('reviewedBy', 'name email')

  res.json(populated)
}

export async function addProjectComment(req, res) {
  const project = await Project.findById(req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found' })

  const { text, parentId } = req.body
  if (!text?.trim()) return res.status(400).json({ message: 'Text required' })

  const comment = {
    user: req.user._id,
    text: text.trim(),
  }

  if (parentId) {
    // Find parent comment and add as reply
    const parentIndex = project.comments.findIndex(c => c._id.toString() === parentId)
    if (parentIndex === -1) return res.status(400).json({ message: 'Parent comment not found' })
    if (!project.comments[parentIndex].replies) project.comments[parentIndex].replies = []
    project.comments[parentIndex].replies.push(comment)
  } else {
    project.comments.push(comment)
  }

  await project.save()

  const populated = await Project.findById(project._id).populate(
    'comments.user', 'name'
  ).populate('comments.replies.user', 'name')

  res.status(201).json({ comments: populated.comments })
}

export async function deleteProject(req, res) {
  const item = await Project.findById(req.params.id)
  if (!item) {
    return res.status(404).json({ message: 'Project not found' })
  }

  await item.deleteOne()
  res.json({ message: 'Project deleted successfully' })
}

