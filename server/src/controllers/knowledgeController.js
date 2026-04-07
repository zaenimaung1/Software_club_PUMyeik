import Knowledge from '../models/Knowledge.js'

export async function listKnowledge(req, res) {
  const items = await Knowledge.find()
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 })
  res.json(items)
}

export async function createKnowledgeItem(req, res) {
  const { imageUrl, caption } = req.body
  if (!imageUrl || !caption) {
    return res.status(400).json({ message: 'Missing fields' })
  }
  const item = await Knowledge.create({
    imageUrl,
    caption,
    uploadedBy: req.user._id,
  })
  res.status(201).json(item)
}

export async function updateKnowledgeItem(req, res) {
  const item = await Knowledge.findById(req.params.id)
  if (!item) return res.status(404).json({ message: 'Knowledge item not found' })

  const { imageUrl, caption } = req.body
  if (imageUrl) item.imageUrl = imageUrl
  if (caption) item.caption = caption
  await item.save()
  res.json(item)
}

export async function deleteKnowledgeItem(req, res) {
  const item = await Knowledge.findById(req.params.id)
  if (!item) return res.status(404).json({ message: 'Knowledge item not found' })
  await item.deleteOne()
  res.json({ message: 'Knowledge item deleted' })
}
