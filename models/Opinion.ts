import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOpinion extends Document {
  topic: string;
  topicId?: string;
  content: string;
  studentName: string;
  studentId: Types.ObjectId;
  studentClass: string;
  classId: Types.ObjectId;
  teacherId: Types.ObjectId;
  sessionCode?: string; // 질문톡톡 세션과 연결
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'feedback_given';
  aiFeedback?: string;
  teacherFeedback?: string;
  teacherNote?: string;
  isPublic: boolean;
  referenceCode: string;
}

const OpinionSchema = new Schema<IOpinion>({
  topic: {
    type: String,
    required: true,
    trim: true
  },
  topicId: {
    type: String,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentClass: {
    type: String,
    required: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  sessionCode: {
    type: String,
    index: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'feedback_given'],
    default: 'pending'
  },
  aiFeedback: {
    type: String,
    maxlength: 3000
  },
  teacherFeedback: {
    type: String,
    maxlength: 2000
  },
  teacherNote: {
    type: String,
    maxlength: 1000
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  referenceCode: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// 인덱스 설정
OpinionSchema.index({ classId: 1 });
OpinionSchema.index({ teacherId: 1 });
OpinionSchema.index({ studentId: 1 });
OpinionSchema.index({ status: 1 });
OpinionSchema.index({ submittedAt: -1 }); // 최신순 정렬용

const Opinion = mongoose.models.Opinion || mongoose.model<IOpinion>('Opinion', OpinionSchema);

export { Opinion };
export default Opinion;