const fs = require('fs');
const { createCanvas } = require('canvas');

// 航空公司代码列表
const airlines = [
  { code: 'aa', name: 'American Airlines', color: '#0078D2' },
  { code: 'ba', name: 'British Airways', color: '#2A5BA4' },
  { code: 'dl', name: 'Delta Airlines', color: '#003366' },
  { code: 'ua', name: 'United Airlines', color: '#005DAA' },
  { code: 'lh', name: 'Lufthansa', color: '#05164D' },
  { code: 'af', name: 'Air France', color: '#002157' },
  { code: 'kl', name: 'KLM', color: '#00A1DE' },
  { code: 'ek', name: 'Emirates', color: '#D71921' },
  { code: 'qr', name: 'Qatar Airways', color: '#5C0632' },
  { code: 'cx', name: 'Cathay Pacific', color: '#006B6E' },
  { code: 'sq', name: 'Singapore Airlines', color: '#F1B434' },
  { code: 'qf', name: 'Qantas', color: '#EE0000' },
  { code: 'ac', name: 'Air Canada', color: '#CE0000' },
  { code: 'nz', name: 'Air New Zealand', color: '#00247D' },
  { code: 'sa', name: 'South African Airways', color: '#003366' },
  { code: 'ib', name: 'Iberia', color: '#FF1D25' },
  { code: 'az', name: 'Alitalia', color: '#006543' },
  { code: 'ey', name: 'Etihad Airways', color: '#BD8B13' },
  { code: 'tk', name: 'Turkish Airlines', color: '#C70A0C' },
  { code: 'su', name: 'Aeroflot', color: '#002B5C' }
];

// 确保目录存在
const dir = './public/airlines';
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

// 为每个航空公司生成logo
airlines.forEach(airline => {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // 白色背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 200, 200);

  // 圆形背景
  ctx.beginPath();
  ctx.arc(100, 100, 80, 0, Math.PI * 2);
  ctx.fillStyle = airline.color;
  ctx.fill();

  // 文字
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(airline.code.toUpperCase(), 100, 100);

  // 保存为PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${dir}/${airline.code}.png`, buffer);
});

console.log('Generated airline logos successfully!');
