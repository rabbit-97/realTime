import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.resolve('/Users/ws/Desktop/Real time/assets/item.json');

const readFileTest = async () => {
  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    console.log(`읽어들인 JSON 파일 데이터: ${fileData}`);
  } catch (err) {
    console.error('파일 읽기 오류:', err);
  }
};

readFileTest();
