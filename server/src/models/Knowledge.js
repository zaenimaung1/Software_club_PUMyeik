import mongoose from 'mongoose'

const knowledgeSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    caption: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'knowledge' },
)

export default mongoose.model('Knowledge', knowledgeSchema)
