import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  provider: 'google';
  createdAt: Date;
  isActive: boolean;
}

const TeacherSchema = new Schema<ITeacher>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    enum: ['google'],
    default: 'google'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 인덱스 설정
TeacherSchema.index({ firebaseUid: 1 });
TeacherSchema.index({ email: 1 });

export default function getTeacherModel() {
  return mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
}