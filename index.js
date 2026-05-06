const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = process.env.PORT || 3000; // مهم جداً عشان Render
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // عشان يشوف الصور والـ CSS

// مصفوفة لتخزين الطلبات (في الحقيقة بنستخدم قاعدة بيانات أو ملف JSON)
let pendingChannels = [];
let approvedChannels = [
    { name: "TREKA23", viewers: "118", status: "live", title: "بث تجريبي" }
];

// 1. استقبال طلب إضافة قناة
app.post('/add-channel', (req, res) => {
    const channelName = req.body.name;
    pendingChannels.push({ name: channelName, status: 'pending' });
    res.json({ message: "تم إرسال طلبك للآدمن!" });
});

// 2. جلب القنوات المعتمدة للموقع
app.get('/get-channels', (req, res) => {
    res.json(approvedChannels);
});

// 3. جلب الطلبات لصفحة الآدمن
app.get('/admin/requests', (req, res) => {
    res.json(pendingChannels);
});

app.listen(3000, () => console.log('سيرفرك شغال على http://localhost:3000'));
