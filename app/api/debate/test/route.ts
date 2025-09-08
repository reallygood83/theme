import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import mongoose from 'mongoose';

// GET: MongoDB 연결 테스트
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const testData = {
      status: states[connectionState as keyof typeof states],
      database: mongoose.connection.db?.databaseName || 'unknown',
      timestamp: new Date().toISOString(),
      collections: await mongoose.connection.db?.listCollections().toArray() || []
    };

    if (connectionState === 1) {
      return createSuccessResponse(testData, 'MongoDB 연결이 성공적으로 되었습니다.');
    } else {
      return createErrorResponse(`MongoDB 연결 상태: ${testData.status}`, 500);
    }
  });
}