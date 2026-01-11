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

// إعداد التخزين
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
app.use(express.urlencoded({ extended: true })); // لقراءة كلمة السر من الفورم
app.use('/apps', express.static(uploadDir));

// واجهة رفع الملفات مع حماية بكلمة سر
app.post('/upload', upload.single('apkFile'), (req, res) => {
    // ADMIN_PASSWORD يجب أن تضيفها في قسم الـ Secrets في ريبلت
    const masterPassword = process.env['ADMIN_PASSWORD'] || "1234"; 
    const userPassword = req.body.password;

    if (userPassword !== masterPassword) {
        if (req.file) fs.unlinkSync(req.file.path); // حذف الملف إذا كانت كلمة السر خطأ
        return res.status(403).send('<h1>عذراً، كلمة السر خاطئة! الرفع للمالك فقط.</h1><a href="/">عودة للمتجر</a>');
    }

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
    console.log(`Server is running on port ${PORT}`);
});
