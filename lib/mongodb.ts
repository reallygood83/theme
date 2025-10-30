// Firebase 마이그레이션 완료: MongoDB 연결이 더 이상 필요하지 않습니다.
// 모든 데이터가 Firebase Realtime Database로 이전되었습니다.

export async function connectMongoDB() {
  throw new Error('MongoDB 연결은 Firebase 마이그레이션으로 인해 사용 중단되었습니다.');
}

export default connectMongoDB;