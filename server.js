const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// التأكد من وجود مجلد ثابت لحفظ التطبيقات
const uploadDir = path.join(__dirname, 'public/apps');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد التخزين باسم الملف الأصلي
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/apps', express.static(uploadDir));

// واجهة رفع الملفات - تم تصحيح الخطأ هنا (إضافة res)
app.post('/upload', upload.single('apkFile'), (req, res) => {
    if (!req.file) return res.status(400).send('لم يتم اختيار ملف.');
    res.redirect('/');
});

// جلب قائمة التطبيقات
app.get('/list-apps', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.json([]);
        const apps = files.map(file => ({
            name: file,
            url: `/apps/${file}`
        }));
        res.json(apps);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
