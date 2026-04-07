/** Map MongoDB blog document (from GET /api/blogs) to client blog shape. */
export function mapBlogFromApi(b) {
  return {
    id: String(b._id),
    title: b.title,
    content: b.content,
    author:
      typeof b.author === 'object' && b.author?.name ? b.author.name : 'Unknown',
    createdAt: b.date || (b.createdAt
      ? new Date(b.createdAt).toISOString().slice(0, 10)
      : ''),
    likes: (b.likes || []).map((id) => String(id)),
    comments: (b.comments || []).map((c) => ({
      id: String(c._id ?? c.id ?? ''),
      user:
        typeof c.user === 'object' && c.user?.name ? c.user.name : 'Member',
      text: c.text,
    })),
  }
}
