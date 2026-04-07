import Blog from '../models/Blog.js'

export async function listBlogs(req, res) {
  const blogs = await Blog.find()
    .populate('author', 'name')
    .populate('comments.user', 'name')
    .sort({ createdAt: -1 })
  res.json(blogs)
}

export async function createBlog(req, res) {
  const { title, content, date } = req.body
  if (!title || !content || !date) {
    return res.status(400).json({ message: 'Title, description, and date are required' })
  }
  const blog = await Blog.create({
    title,
    content,
    date,
    author: req.user._id,
  })
  const populated = await Blog.findById(blog._id).populate('author', 'name')
  res.status(201).json(populated)
}

export async function updateBlog(req, res) {
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ message: 'Blog not found' })

  const { title, content, date } = req.body
  if (title) blog.title = title
  if (content) blog.content = content
  if (date) blog.date = date
  await blog.save()
  res.json(blog)
}

export async function deleteBlog(req, res) {
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ message: 'Blog not found' })
  await blog.deleteOne()
  res.json({ message: 'Blog deleted' })
}

export async function toggleLike(req, res) {
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ message: 'Blog not found' })

  const userId = req.user._id.toString()
  const hasLiked = blog.likes.map((id) => id.toString()).includes(userId)

  if (hasLiked) {
    blog.likes = blog.likes.filter((id) => id.toString() !== userId)
  } else {
    blog.likes.push(req.user._id)
  }

  await blog.save()
  res.json({ likes: blog.likes.length })
}

export async function addComment(req, res) {
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ message: 'Blog not found' })

  const { text } = req.body
  if (!text) return res.status(400).json({ message: 'Text required' })

  blog.comments.push({ user: req.user._id, text })
  await blog.save()

  const populated = await Blog.findById(blog._id).populate(
    'comments.user',
    'name',
  )

  res.status(201).json(populated.comments)
}
