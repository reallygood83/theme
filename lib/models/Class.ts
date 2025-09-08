import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITopic {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
}

export interface IClass extends Document {
  name: string;
  code: string;
  teacherId: Types.ObjectId;
  firebaseUid: string; // Firebase 교사 UID
  sessionCode?: string; // 질문톡톡 세션과 연결
  topics: ITopic[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ClassSchema = new Schema<IClass>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    length: 4,
    uppercase: true
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  firebaseUid: {
    type: String,
    required: true,
    index: true
  },
  sessionCode: {
    type: String,
    index: true
  },
  topics: [TopicSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 인덱스 설정
ClassSchema.index({ code: 1 });
ClassSchema.index({ teacherId: 1 });
ClassSchema.index({ firebaseUid: 1 });
ClassSchema.index({ sessionCode: 1 });

export default function getClassModel() {
  return mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
}