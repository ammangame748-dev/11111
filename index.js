const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000; // Render بيستخدم هاد المتغير

app.use(bodyParser.json());
// تأكد إن ملف index.html موجود داخل مجلد public
app.use(express.static(path.join(__dirname, 'public'))); 

// مصفوفة لتخزين الطلبات
let pendingChannels = [];
let approvedChannels = [
    { name: "TREKA23", viewers: "118", status: "live", title: "بث تجريبي" }
];

// --- المسارات (Routes) ---

// 1. عرض الصفحة الرئيسية (حل مشكلة Cannot GET /)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. استقبال طلب إضافة قناة
app.post('/add-channel', (req, res) => {
    const channelName = req.body.name;
    pendingChannels.push({ name: channelName, status: 'pending' });
    res.json({ message: "تم إرسال طلبك للآدمن!" });
});

// 3. جلب القنوات المعتمدة للموقع
app.get('/get-channels', (req, res) => {
    res.json(approvedChannels);
});

// 4. جلب الطلبات لصفحة الآدمن
app.get('/admin/requests', (req, res) => {
    res.json(pendingChannels);
});

// تشغيل السيرفر باستخدام المتغير port
app.listen(port, () => console.log(`سيرفرك شغال على منفذ ${port}`));
