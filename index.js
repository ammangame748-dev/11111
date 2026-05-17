const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

const app = express();

// الإعدادات الأساسية والمصاحبة لبنية المجلدات
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// قاعدة البيانات
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hsamhmaydh4_db_user:xls5Av4Nr4a5PA7W@cluster0.wjnh8d0.mongodb.net/BlackListDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ متصل بقاعدة البيانات بنجاح'))
    .catch(err => console.error('❌ خطأ قاعدة البيانات:', err));

// الموديل مضاف إليه الحقول التي يستدعيها ملف التصميم لمنع الانهيار
const Streamer = mongoose.model('KickConfig', new mongoose.Schema({
    kickUsername: { type: String, required: true, unique: true },
    isLive: { type: Boolean, default: false },
    profilePic: { type: String, default: '' },
    viewers: { type: Number, default: 0 },
    twitterUrl: { type: String, default: '' },
    kickUrl: { type: String, default: '' }
}));

// دالة تخطي حظر جدار الحماية لجلب الصورة وحالة البث
let isUpdating = false;
async function updateKickStatus() {
    if (isUpdating) return;
    isUpdating = true;
    console.log("🚀 جاري فحص حالة البث وتحديث الصور...");

    try {
        const streamers = await Streamer.find({});
        for (const streamer of streamers) {
            try {
                const cleanName = streamer.kickUsername.trim().toLowerCase();

                // تصحيح خطأ الرابط وصيغة الـ Template Literal بشكل سليم 100%
                const response = await axios.get(`https://kick.com/api/v1/channels/${cleanName}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Accept": "application/json, text/plain, */*",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Referer": "https://kick.com"
                    },
                    timeout: 10000
                });

                if (response.data) {
                    const data = response.data;
                    const isLive = !!data.livestream;
                    const profilePic = data.user?.profile_pic || data.user?.profile?.avatar || "";
                    const viewers = data.livestream?.viewer_count || 0;

                    await Streamer.updateOne(
                        { _id: streamer._id },
                        { $set: { isLive, profilePic, viewers } }
                    );
                    console.log(`✅ ${cleanName} | بث: ${isLive ? "🔴 فاتح" : "⚫ مغلق"}`);
                }
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    console.log(`⚠️ حظر 403 من كيك للمستخدم (${streamer.kickUsername}) - تحويل آمن للحالة المؤقتة.`);
                    await Streamer.updateOne(
                        { _id: streamer._id },
                        { $set: { isLive: false, viewers: 0 } }
                    );
                } else {
                    console.log(`❌ خطأ مع الستريمر (${streamer.kickUsername}): ${err.message}`);
                }
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (globalErr) {
        console.error("❌ خطأ عام:", globalErr.message);
    } finally {
        isUpdating = false;
    }
}

// تشغيل دوري كل 5 دقائق وتشغيل فوري بعد إقلاع السيرفر بـ 3 ثوانٍ
setInterval(updateKickStatus, 300000);
setTimeout(updateKickStatus, 3000);

// المسارات
app.get('/', async (req, res) => {
    try {
        const streamersData = await Streamer.find({}).sort({ isLive: -1 });

        // حساب المتغيرات المطلوبة لعرض الإحصائيات في ملف index.ejs دون أخطاء
        const totalStreamers = streamersData.length;
        const liveNow = streamersData.filter(s => s.isLive).length;
        const totalViewers = streamersData.reduce((acc, curr) => acc + (curr.viewers || 0), 0);

        res.render('index', {
            streamers: streamersData,
            stats: {
                totalStreamers: totalStreamers,
                totalViewers: totalViewers,
                liveNow: liveNow
            }
        });
    } catch (err) {
        res.status(500).send("خطأ في السيرفر");
    }
});

// مسار استقبال طلبات الانضمام بناءً على الـ Form في ملف الـ EJS الخاص بك
app.post('/apply', async (req, res) => {
    try {
        const { kickUser } = req.body;
        if (!kickUser) return res.status(400).send("الاسم مطلوب");
        await Streamer.create({ kickUsername: kickUser.trim() });
        res.send("<script>alert('تم إرسال الطلب بنجاح!'); window.location='/';</script>");
        setTimeout(updateKickStatus, 1000);
    } catch (err) {
        res.status(500).send("الاسم مضاف سابقاً أو حدث خطأ");
    }
});

// مسار إضافة ستريمر من الكود القديم لحفظ التوافقية
app.post('/add-streamer', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).send("الاسم مطلوب");
        await Streamer.create({ kickUsername: username.trim() });
        res.send("<script>alert('تم إضافة الستريمر بنجاح!'); window.location='/';</script>");
        setTimeout(updateKickStatus, 1000);
    } catch (err) {
        res.status(500).send("الاسم مضاف سابقاً أو حدث خطأ");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 السيرفر يعمل على منفذ: ${PORT}`));
