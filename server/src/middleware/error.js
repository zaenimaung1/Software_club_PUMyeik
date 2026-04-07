export function notFound(req, res, next) {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` })
}

export function errorHandler(err, req, res, next) {
  console.error(err)

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Uploaded image is too large for the server request limit' })
  }

  res.status(err.status || 500).json({ message: err.message || 'Server error' })
}
