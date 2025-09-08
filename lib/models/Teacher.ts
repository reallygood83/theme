import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  firebaseUid?: string; // Firebase UID (선택적)
  email: string;
  name: string;
  provider: 'google' | 'email' | 'existing'; // 기존 사용자 지원
  school?: string; // 소속 학교
  position?: string; // 직책/직급
  phone?: string; // 연락처
  passwordHash?: string; // 비밀번호 해시 (Firebase 미사용 시)
  createdAt: Date;
  isActive: boolean;
  // 기존 사용자 마이그레이션을 위한 필드
  legacyUserId?: string; // 기존 시스템의 사용자 ID
  migrationDate?: Date; // 마이그레이션 날짜
  lastLoginAt?: Date; // 마지막 로그인
  // 권한 관리
  permissions: {
    canCreateSession: boolean;
    canManageStudents: boolean;
    canViewStatistics: boolean;
    isAdmin?: boolean;
  };
  // 메서드
  hasPermission(permission: keyof ITeacher['permissions']): boolean;
  updateLastLogin(): Promise<ITeacher>;
}

const TeacherSchema = new Schema<ITeacher>({
  firebaseUid: {
    type: String,
    required: false, // Firebase 사용하지 않는 사용자도 지원
    unique: true,
    sparse: true, // null/undefined 값에 대해서는 유니크 제약 무시
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
    enum: ['google', 'email', 'existing'],
    default: 'email'
  },
  school: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  passwordHash: {
    type: String,
    select: false // 기본 쿼리에서 제외 (보안)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  legacyUserId: {
    type: String,
    sparse: true,
    index: true
  },
  migrationDate: {
    type: Date
  },
  lastLoginAt: {
    type: Date
  },
  permissions: {
    canCreateSession: {
      type: Boolean,
      default: true
    },
    canManageStudents: {
      type: Boolean,
      default: true
    },
    canViewStatistics: {
      type: Boolean,
      default: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// 인덱스 설정
TeacherSchema.index({ firebaseUid: 1 });
TeacherSchema.index({ email: 1 });
TeacherSchema.index({ legacyUserId: 1 });
TeacherSchema.index({ provider: 1 });
TeacherSchema.index({ school: 1 });

// 가상 필드: 표시명
TeacherSchema.virtual('displayName').get(function(this: ITeacher) {
  if (this.position && this.school) {
    return `${this.name} (${this.school} ${this.position})`;
  } else if (this.school) {
    return `${this.name} (${this.school})`;
  }
  return this.name;
});

// 메서드: 권한 확인
TeacherSchema.methods.hasPermission = function(permission: keyof ITeacher['permissions']) {
  return this.permissions[permission] === true;
};

// 메서드: 로그인 시간 업데이트
TeacherSchema.methods.updateLastLogin = async function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// 스태틱 메서드: 기존 사용자 마이그레이션
TeacherSchema.statics.migrateExistingUser = async function(userData: {
  email: string;
  name: string;
  school?: string;
  position?: string;
  legacyUserId?: string;
}) {
  const existingTeacher = await this.findOne({ email: userData.email });
  
  if (existingTeacher) {
    // 기존 데이터 업데이트
    if (userData.legacyUserId && !existingTeacher.legacyUserId) {
      existingTeacher.legacyUserId = userData.legacyUserId;
      existingTeacher.migrationDate = new Date();
      existingTeacher.provider = 'existing';
    }
    
    // 추가 정보 업데이트
    if (userData.school && !existingTeacher.school) existingTeacher.school = userData.school;
    if (userData.position && !existingTeacher.position) existingTeacher.position = userData.position;
    
    await existingTeacher.save();
    return existingTeacher;
  } else {
    // 새 사용자 생성
    const newTeacher = new this({
      email: userData.email,
      name: userData.name,
      school: userData.school,
      position: userData.position,
      legacyUserId: userData.legacyUserId,
      provider: 'existing',
      migrationDate: new Date(),
      permissions: {
        canCreateSession: true,
        canManageStudents: true,
        canViewStatistics: true,
        isAdmin: false
      }
    });
    
    await newTeacher.save();
    return newTeacher;
  }
};

export default function getTeacherModel() {
  return mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
}