const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();

// الإعدادات الأساسية
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ================= DATABASE =================
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hsamhmaydh4_db_user:xls5Av4Nr4a5PA7W@cluster0.wjnh8d0.mongodb.net/BlackListDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ متصل بالداتابيز بنجاح'))
    .catch(err => console.error('❌ خطأ في الاتصال بالداتابيز:', err));

// ================= MODELS =================
const Streamer = mongoose.model('KickConfig', new mongoose.Schema({
    kickUsername: String,
    isLive: { type: Boolean, default: false },
    viewers: { type: Number, default: 0 },
    profilePic: String
}));

const Application = mongoose.model('Application', new mongoose.Schema({
    kickUsername: String,
    discordName: String,
    status: { type: String, default: 'pending' }
}));

// ================= FUNCTIONS =================
async function updateStatus() {
    try {
        const streamers = await Streamer.find({});
        if (streamers.length === 0) return;

        console.log("🔄 جاري تحديث حالة البث...");
        for (const streamer of streamers) {
            try {
                const username = streamer.kickUsername.toLowerCase().trim();
                const res = await axios.get(`https://kick.com/api/v2/channels/${username}`, {
                    timeout: 5000,
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Accept": "application/json"
                    }
                });
                
                const data = res.data;
                const isLive = !!data.livestream;
                const viewers = isLive ? data.livestream.viewer_count : 0;
                const profilePic = data.user?.profile_pic || data.user?.avatar || null;

                await Streamer.updateOne(
                    { _id: streamer._id },
                    { $set: { isLive, viewers, profilePic } }
                );
            } catch (err) {
                console.error(`❌ خطأ في جلب بيانات ${streamer.kickUsername}`);
            }
        }
    } catch (err) {
        console.error("❌ فشل تحديث البيانات العامة:", err.message);
    }
}

// تحديث تلقائي كل دقيقة
setInterval(updateStatus, 60000);
updateStatus();

// ================= ROUTES =================

// الصفحة الرئيسية مع معالجة الأخطاء
app.get('/', async (req, res) => {
    try {
        const streamersData = await Streamer.find({}).sort({ isLive: -1, viewers: -1 }) || [];
        
        const stats = {
            totalStreamers: streamersData.length || 0,
            liveNow: streamersData.filter(s => s.isLive).length || 0,
            totalViewers: streamersData.reduce((a, b) => a + (b.viewers || 0), 0) || 0
        };

        // هون السر: بنبعث البيانات باسم streamers وباسم services عشان يشتغل الكود القديم والجديد
        res.render('index', { 
            streamers: streamersData, 
            services: streamersData, // هذا السطر بيحل مشكلة ReferenceError: services is not defined
            stats: stats 
        });
    } catch (err) {
        console.error("❌ خطأ في عرض الصفحة:", err);
        res.status(500).send("Internal Server Error");
    }
});


// إرسال طلب انضمام
app.post('/apply', async (req, res) => {
    try {
        const { kickUser, discordName } = req.body;
        if (!kickUser) return res.send("الاسم مطلوب");
        const clean = kickUser.trim();
        await Application.deleteMany({ kickUsername: clean });
        await Application.create({ kickUsername: clean, discordName });
        res.send("<script>alert('✅ تم إرسال طلبك!'); window.location='/';</script>");
    } catch (err) {
        res.status(500).send("خطأ في إرسال الطلب");
    }
});

// لوحة الإدارة
app.get('/admin-justice', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
    try {
        const apps = await Application.find({ status: 'pending' });
        const streamers = await Streamer.find({});
        res.render('admin', { apps, streamers });
    } catch (err) {
        res.status(500).send("خطأ في تحميل لوحة الإدارة");
    }
});

// قبول طلب
app.get('/admin/accept/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
    try {
        const appData = await Application.findByIdAndDelete(req.params.id);
        if (appData) {
            await Streamer.updateOne(
                { kickUsername: appData.kickUsername },
                { $set: { kickUsername: appData.kickUsername } },
                { upsert: true }
            );
        }
        res.redirect('/admin-justice?pass=1234');
    } catch (err) {
        res.send("خطأ في قبول الطلب");
    }
});

// رفض طلب
app.get('/admin/reject/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
    try {
        await Application.findByIdAndDelete(req.params.id);
        res.redirect('/admin-justice?pass=1234');
    } catch (err) {
        res.send("خطأ في الرفض");
    }
});

// حذف ستريمر
app.get('/admin/delete-streamer/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌ غير مصرح");
    try {
        await Streamer.findByIdAndDelete(req.params.id);
        res.redirect('/admin-justice?pass=1234');
    } catch (err) {
        res.send("خطأ في الحذف");
    }
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
});
