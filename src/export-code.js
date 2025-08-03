const fs = require('fs');
const path = require('path');

// Список файлов и папок, которые мы хотим экспортировать
const pathsToExport = [
  'package.json',
  'vite.config.js',
  'src' // Экспортируем всю папку src
];

const outputFileName = 'project_code.txt';
let output = '';

// Функция для рекурсивного обхода папок
function readDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readDirectory(filePath); // Если это папка, идем глубже
    } else if (['.js', '.vue', '.css', '.json'].includes(path.extname(filePath))) {
      // Если это файл с нужным расширением, добавляем его в вывод
      const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
      output += `\n### ${relativePath}\n`;
      output += '```\n';
      output += fs.readFileSync(filePath, 'utf-8');
      output += '\n```\n';
    }
  }
}

// Основная логика
try {
  for (const p of pathsToExport) {
    const fullPath = path.join(__dirname, p);
    if (!fs.existsSync(fullPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readDirectory(fullPath);
    } else {
      const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
      output += `\n### ${relativePath}\n`;
      output += '```\n';
      output += fs.readFileSync(fullPath, 'utf-8');
      output += '\n```\n';
    }
  }

  fs.writeFileSync(outputFileName, output);
  console.log(`Проект успешно экспортирован в файл: ${outputFileName}`);
} catch (error) {
  console.error('Произошла ошибка при экспорте проекта:', error);
}