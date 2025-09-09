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
  joinCode?: string;
  description?: string;
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
  joinCode: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true
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

// 인덱스 설정 - 필드에 index: true가 이미 설정된 경우 중복 제거
ClassSchema.index({ code: 1 });
ClassSchema.index({ teacherId: 1 });
// firebaseUid와 sessionCode는 이미 필드에 index: true로 설정됨

export default function getClassModel() {
  return mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
}