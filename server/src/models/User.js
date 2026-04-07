import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    photo: { type: String, default: '' },
    gender: { type: String, default: '' },
    batch: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  },
  { timestamps: true },
)

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)
