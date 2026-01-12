const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = './database.json';

// تأمين المجلدات
if (!fs.existsSync('./public/apps')) fs.mkdirSync('./public/apps', { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

const storage = multer.diskStorage({
    destination: './public/apps',
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use('/apps', express.static('./public/apps'));

// جلب التطبيقات من القاعدة
app.get('/list-apps', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(data);
});

// رفع تطبيق جديد مع حماية
app.post('/upload', upload.single('apkFile'), (req, res) => {
    const masterPassword = process.env['ADMIN_PASSWORD'] || "1234";
    const { password, appName, description, imageUrl } = req.body;

    if (password !== masterPassword) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).send('كلمة سر خاطئة! <a href="/">عودة</a>');
    }

    const db = JSON.parse(fs.readFileSync(DB_FILE));
    db.push({
        id: Date.now(),
        name: appName,
        desc: description,
        img: imageUrl || "https://cdn-icons-png.flaticon.com/512/2522/2522649.png",
        url: `/apps/${req.file.filename}`
    });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    res.redirect('/');
});

// ميزة الحذف الجديدة
app.post('/delete-app', (req, res) => {
    const masterPassword = process.env['ADMIN_PASSWORD'] || "1234";
    const { password, appId } = req.body;

    if (password !== masterPassword) return res.status(403).send('كلمة سر الحذف خاطئة!');

    let db = JSON.parse(fs.readFileSync(DB_FILE));
    const appToDelete = db.find(a => a.id == appId);

    if (appToDelete) {
        const filePath = path.join(__dirname, 'public', appToDelete.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
        db = db.filter(a => a.id != appId); 
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    }
    res.redirect('/');
});

app.listen(PORT, () => console.log(`المتجر يعمل على منفذ ${PORT}`));
