import mongoose from 'mongoose'

const feedbackTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['positive', 'constructive', 'question', 'custom'],
    default: 'custom'
  },
  teacherId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export const FeedbackTemplate = mongoose.models.FeedbackTemplate || mongoose.model('FeedbackTemplate', feedbackTemplateSchema)