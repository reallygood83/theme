import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  classId: Types.ObjectId;
  accessCode: string;
  sessionCode?: string; // 질문톡톡 세션과 연결
  groupName?: string; // 모둠명
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const StudentSchema = new Schema<IStudent>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  accessCode: {
    type: String,
    required: true,
    unique: true
  },
  sessionCode: {
    type: String,
    index: true
  },
  groupName: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 인덱스 설정 - 필드에 index: true가 이미 설정된 경우 중복 제거
StudentSchema.index({ accessCode: 1 });
StudentSchema.index({ classId: 1 });
// sessionCode는 이미 필드에 index: true로 설정됨

export default function getStudentModel() {
  return mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
}