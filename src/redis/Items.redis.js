import fs from 'fs';
import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const saveItemsToRedis = async () => {
  await redisClient.connect();

  // item.json 파일 읽기
  const data = JSON.parse(fs.readFileSync('item.json', 'utf8')).data;

  // 레디스에 데이터 저장
  for (const item of data) {
    await redisClient.hSet(`item:${item.id}`, 'score', item.score);
  }

  await redisClient.quit();
};

saveItemsToRedis().catch(console.error);
