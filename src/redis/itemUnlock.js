import { promises as fs } from 'fs';
import path from 'path';
import { Redis } from 'ioredis';

const redisClient = new Redis(); // 기본적으로 localhost:6379에 연결됨

/**
 * JSON 파일을 읽고 Redis에 데이터를 저장하는 함수
 * @param {Object} redisClient - Redis 클라이언트 인스턴스
 * @param {string} jsonFilePath - JSON 파일 경로
 */
const saveJsonToRedis = async (redisClient, jsonFilePath) => {
  try {
    // JSON 파일 경로 설정
    const filePath = path.resolve(jsonFilePath);
    console.log(`JSON 파일 경로: ${filePath}`);

    // JSON 파일 존재 여부 확인
    try {
      await fs.access(filePath);
      console.log(`파일이 존재합니다: ${filePath}`);
    } catch (accessError) {
      console.error(`파일이 존재하지 않습니다: ${filePath}`, accessError);
      return; // 파일이 없으면 함수 종료
    }

    // JSON 파일 읽기
    let fileData;
    try {
      fileData = await fs.readFile(filePath, 'utf-8');
      console.log(`읽어들인 JSON 파일 데이터: ${fileData}`);
    } catch (readError) {
      console.error('JSON 파일 읽기 오류:', readError);
      throw new Error('JSON 파일 읽기 오류');
    }

    // JSON 데이터를 객체로 변환
    let jsonData;
    try {
      jsonData = JSON.parse(fileData);
      console.log(`JSON 데이터 객체: ${JSON.stringify(jsonData, null, 2)}`);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      throw new Error('JSON 파싱 오류');
    }

    // Redis에 데이터 저장
    if (Array.isArray(jsonData.data)) {
      for (const item of jsonData.data) {
        const key = `item:${item.id}`;
        await redisClient.set(key, JSON.stringify(item));
        console.log(`Redis에 저장된 키: ${key}, 값: ${JSON.stringify(item)}`);
      }
    } else {
      console.error('JSON 데이터 형식이 올바르지 않습니다.');
    }

    console.log('JSON 데이터를 성공적으로 Redis에 저장했습니다.');
  } catch (err) {
    console.error('JSON 데이터를 Redis에 저장하는 중 오류가 발생했습니다:', err);
    throw err;
  }
};

export default saveJsonToRedis;
