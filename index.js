const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

const app = express();

// ================= الإعدادات الأساسية =================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ================= الاتصال بقاعدة البيانات =================
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hsamhmaydh4_db_user:xls5Av4Nr4a5PA7W@cluster0.wjnh8d0.mongodb.net/BlackListDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ متصل بقاعدة البيانات بنجاح'))
    .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// ================= الموديل (بيانات الستريمرز فقط) =================
const Streamer = mongoose.model('KickConfig', new mongoose.Schema({
    kickUsername: { type: String, required: true, unique: true },
    isLive: { type: Boolean, default: false },
    profilePic: { type: String, default: '' }
}));

// ================= دالة جلب الحالة والصورة من كيك =================
let isUpdating = false;

async function updateKickStatus() {
    if (isUpdating) return;
    isUpdating = true;
    console.log("🚀 جاري فحص حالة البث وتحديث صور الستريمرز...");

    try {
        const streamers = await Streamer.find({});

        for (const streamer of streamers) {
            try {
                const cleanName = streamer.kickUsername.trim().toLowerCase();

                // محاكاة تصفح حقيقي لتجاوز الحظر والأخطاء
                const response = await axios.get(`https://kick.com/api/v1/channels/${cleanName}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                        "Accept": "application/json",
                        "Referer": "https://kick.com/"
                    },
                    timeout: 10000
                });

                const data = response.data;
                const isLive = !!data.livestream; // True إذا كان هناك بث مباشر حالي، خلاف ذلك False
                const profilePic = data.user?.profile_pic || data.user?.profile?.avatar || "";

                // تحديث الصورة وحالة البث فقط داخل قاعدة البيانات
                await Streamer.updateOne(
                    { _id: streamer._id },
                    { $set: { isLive, profilePic } }
                );

                console.log(`✅ الستريمر: ${cleanName} | البث: ${isLive ? "🔴 فاتح" : "⚫ مغلق"}`);

            } catch (err) {
                console.log(`❌ فشل جلب بيانات المستحدم (${streamer.kickUsername}): ${err.message}`);
            }

            // تأخير 1.5 ثانية لحماية السيرفر من الحظر
            await new Promise(r => setTimeout(r, 1500));
        }
    } catch (globalErr) {
        console.error("❌ خطأ عام في التحديث:", globalErr.message);
    } finally {
        isUpdating = false;
    }
}

// الفحص التلقائي (كل 5 دقائق) وتشغيل فوري عند الإقلاع
setInterval(updateKickStatus, 300000);
setTimeout(updateKickStatus, 5000);

// ================= المسارات (Routes) =================

// 1. الصفحة الرئيسية لعرض الستريمرز وحالتهم
app.get('/', async (req, res) => {
    try {
        // ترتيب الترتيب: الفاتح بث أولاً
        const streamersData = await Streamer.find({}).sort({ isLive: -1 });
        res.render('index', { streamers: streamersData });
    } catch (err) {
        res.status(500).send("خطأ في تحميل الصفحة الرئيسية");
    }
});

// 2. مسار بسيط لإضافة ستريمر جديد للتجربة الفورية
app.post('/add-streamer', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).send("الاسم مطلوب");

        await Streamer.create({ kickUsername: username.trim() });
        res.send("<script>alert('تم إضافة الستريمر، سيتم تحديث حالته وصورته خلال ثوانٍ!'); window.location='/';</script>");
        setTimeout(updateKickStatus, 1000); // تحديث فوري بعد الإضافة
    } catch (err) {
        res.status(500).send("الستريمر مضاف مسبقاً أو حدث خطأ");
    }
});

// ================= بدء تشغيل السيرفر =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 السيرفر يعمل بشكل ممتاز على المنفذ: ${PORT}`));
