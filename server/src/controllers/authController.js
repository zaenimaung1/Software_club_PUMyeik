import User from '../models/User.js'
import { generateToken } from '../utils/token.js'

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    photo: user.photo ?? '',
    gender: user.gender ?? '',
    batch: user.batch ?? '',
    role: user.role,
  }
}

export async function register(req, res) {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    return res.status(400).json({ message: 'Email already exists' })
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: 'member',
  })

  res.status(201).json({
    token: generateToken(user),
    user: serializeUser(user),
  })
}

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  res.json({
    token: generateToken(user),
    user: serializeUser(user),
  })
}

export async function me(req, res) {
  res.json({
    user: serializeUser(req.user),
  })
}
