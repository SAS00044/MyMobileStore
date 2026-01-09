const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // مكتبة قراءة الملفات
const app = express();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/download', express.static('uploads')); // للسماح بتحميل الملفات

// ميزة جديدة: الحصول على قائمة التطبيقات
app.get('/apps', (req, res) => {
  const directoryPath = path.join(__dirname, 'uploads');
  fs.readdir(directoryPath, (err, files) => {
    if (err) return res.status(500).send('خطأ في قراءة الملفات');
    res.json(files);
  });
});

app.post('/upload', upload.single('apkFile'), (req, res) => {
  res.send('<h1>تم الرفع بنجاح!</h1><a href="/">العودة للمتجر</a>');
});

app.listen(3000, () => console.log('المتجر جاهز على http://localhost:3000'));
