import mongoose from 'mongoose'

export interface NotificationData {
  _id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'opinion' | 'feedback'
  read: boolean
  relatedId?: string // 관련 Opinion ID 등
  relatedType?: 'opinion' | 'session' | 'feedback'
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'opinion', 'feedback'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: String,
    index: true
  },
  relatedType: {
    type: String,
    enum: ['opinion', 'session', 'feedback']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// 사용자별 알림 조회를 위한 복합 인덱스
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, read: 1 })

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)