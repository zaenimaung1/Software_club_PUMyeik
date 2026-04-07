import User from '../models/User.js'

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

async function ensureUniqueEmail(email, currentUserId) {
  if (!email) return null
  return User.findOne({
    email: email.toLowerCase(),
    _id: { $ne: currentUserId },
  })
}

export async function listAdmins(req, res) {
  const admins = await User.find({ role: 'admin' }).select('-password')
  res.json(admins)
}

export async function createAdmin(req, res) {
  const { name, email, password, photo, gender, batch } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' })
  }
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    return res.status(400).json({ message: 'Email already exists' })
  }
  const admin = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    photo: typeof photo === 'string' ? photo.trim() : '',
    gender: typeof gender === 'string' ? gender.trim() : '',
    batch: typeof batch === 'string' ? batch.trim() : '',
    role: 'admin',
  })
  res.status(201).json(serializeUser(admin))
}

export async function updateAdmin(req, res) {
  const admin = await User.findOne({ _id: req.params.id, role: 'admin' })
  if (!admin) return res.status(404).json({ message: 'Admin not found' })

  const { name, email, password, photo, gender, batch } = req.body
  if (name) admin.name = name
  if (email) {
    const exists = await ensureUniqueEmail(email, admin._id)
    if (exists) return res.status(400).json({ message: 'Email already exists' })
    admin.email = email.toLowerCase()
  }
  if (password) admin.password = password
  if (typeof photo === 'string') admin.photo = photo.trim()
  if (typeof gender === 'string') admin.gender = gender.trim()
  if (typeof batch === 'string') admin.batch = batch.trim()
  await admin.save()
  res.json(serializeUser(admin))
}

export async function deleteAdmin(req, res) {
  const admin = await User.findOne({ _id: req.params.id, role: 'admin' })
  if (!admin) return res.status(404).json({ message: 'Admin not found' })
  await admin.deleteOne()
  res.json({ message: 'Admin deleted' })
}

export async function listMembers(req, res) {
  const members = await User.find({ role: 'member' }).select('-password')
  res.json(members)
}

export async function createMember(req, res) {
  const { name, email, password, photo, gender, batch } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' })
  }
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    return res.status(400).json({ message: 'Email already exists' })
  }
  const member = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    photo: typeof photo === 'string' ? photo.trim() : '',
    gender: typeof gender === 'string' ? gender.trim() : '',
    batch: typeof batch === 'string' ? batch.trim() : '',
    role: 'member',
  })
  res.status(201).json(serializeUser(member))
}

export async function updateMember(req, res) {
  const member = await User.findOne({ _id: req.params.id, role: 'member' })
  if (!member) return res.status(404).json({ message: 'Member not found' })

  const { name, email, password, photo, gender, batch } = req.body
  if (name) member.name = name
  if (email) {
    const exists = await ensureUniqueEmail(email, member._id)
    if (exists) return res.status(400).json({ message: 'Email already exists' })
    member.email = email.toLowerCase()
  }
  if (password) member.password = password
  if (typeof photo === 'string') member.photo = photo.trim()
  if (typeof gender === 'string') member.gender = gender.trim()
  if (typeof batch === 'string') member.batch = batch.trim()
  await member.save()
  res.json(serializeUser(member))
}

export async function deleteMember(req, res) {
  const member = await User.findOne({ _id: req.params.id, role: 'member' })
  if (!member) return res.status(404).json({ message: 'Member not found' })
  await member.deleteOne()
  res.json({ message: 'Member deleted' })
}

export async function updateMyProfile(req, res) {
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const { name, email, password, photo, gender, batch } = req.body

  if (name !== undefined) {
    const trimmedName = String(name).trim()
    if (!trimmedName) {
      return res.status(400).json({ message: 'Name is required' })
    }
    user.name = trimmedName
  }

  if (email !== undefined) {
    const trimmedEmail = String(email).trim().toLowerCase()
    if (!trimmedEmail) {
      return res.status(400).json({ message: 'Email is required' })
    }
    const exists = await ensureUniqueEmail(trimmedEmail, user._id)
    if (exists) return res.status(400).json({ message: 'Email already exists' })
    user.email = trimmedEmail
  }

  if (password !== undefined) {
    const trimmedPassword = String(password).trim()
    if (trimmedPassword && trimmedPassword.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long' })
    }
    if (trimmedPassword) {
      user.password = trimmedPassword
    }
  }

  if (photo !== undefined) {
    user.photo = String(photo).trim()
  }

  if (gender !== undefined) {
    user.gender = String(gender).trim()
  }

  if (batch !== undefined) {
    user.batch = String(batch).trim()
  }

  await user.save()

  res.json({
    user: serializeUser(user),
  })
}
