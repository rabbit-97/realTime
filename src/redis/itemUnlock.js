import { promises as fs } from 'fs';
import path from 'path';

/**
 * JSON 파일을 읽고 Redis에 데이터를 저장하는 함수
 * @param {Object} redisClient - Redis 클라이언트 인스턴스
 * @param {string} jsonFilePath - JSON 파일 경로
 */
const saveJsonToRedis = async (redisClient, jsonFilePath) => {
  try {
    // JSON 파일 경로 설정
    const filePath = path.resolve(jsonFilePath);

    // JSON 파일 읽기
    const fileData = await fs.readFile(filePath, 'utf-8');

    // JSON 데이터를 객체로 변환
    const jsonData = JSON.parse(fileData);

    // Redis에 데이터 저장
    for (const [key, value] of Object.entries(jsonData)) {
      await redisClient.set(key, JSON.stringify(value));
    }

    console.log('JSON 데이터를 성공적으로 Redis에 저장했습니다.');
  } catch (err) {
    console.error('JSON 데이터를 Redis에 저장하는 중 오류가 발생했습니다:', err);
  }
};

export default saveJsonToRedis;
