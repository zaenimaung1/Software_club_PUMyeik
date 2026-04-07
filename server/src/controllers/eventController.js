import Event from '../models/Event.js'

export async function listEvents(req, res) {
  const events = await Event.find().sort({ date: 1 })
  res.json(events)
}

export async function createEvent(req, res) {
  const { title, description, date, location } = req.body
  if (!title || !description || !date || !location) {
    return res.status(400).json({ message: 'Missing fields' })
  }
  const event = await Event.create({ title, description, date, location })
  res.status(201).json(event)
}

export async function updateEvent(req, res) {
  const event = await Event.findById(req.params.id)
  if (!event) return res.status(404).json({ message: 'Event not found' })

  const { title, description, date, location } = req.body
  if (title) event.title = title
  if (description) event.description = description
  if (date) event.date = date
  if (location) event.location = location
  await event.save()
  res.json(event)
}

export async function deleteEvent(req, res) {
  const event = await Event.findById(req.params.id)
  if (!event) return res.status(404).json({ message: 'Event not found' })
  await event.deleteOne()
  res.json({ message: 'Event deleted' })
}
