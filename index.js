const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { fetch } = require('undici');

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

let isUpdating = false;
async function updateKickStatus() {
    if (isUpdating) return;
    isUpdating = true;
    console.log("🚀 جاري فحص حالة البث باستخدام تقنية fetch الذكية المدمجة...");

    try {
        const streamers = await Streamer.find({});
        for (const streamer of streamers) {
            const cleanName = streamer.kickUsername.trim().toLowerCase();
            try {
                // طلب البيانات مباشرة من رابط كيك الأساسي باستخدام fetch المدمجة في Node 24
                const response = await fetch(`https://kick.com/video/embed/${cleanName}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Accept": "application/json, text/plain, */*",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Referer": "https://kick.com"
                    }
                });

                if (!response.ok) {
                    throw new Error(`خطأ في الشبكة: ${response.status}`);
                }

                const html = await response.text();

                // فحص ذكي داخل نص الصفحة لمعرفة حالة البث
                const isLive = html.includes('"isLive":true') || html.includes('🔴') || !html.includes('is-offline');
                let viewers = isLive ? 1 : 0; 
                let profilePic = streamer.profilePic; 

                await Streamer.updateOne(
                    { _id: streamer._id },
                    { $set: { isLive, profilePic, viewers } }
                );
                console.log(`✅ ${cleanName} | بث: ${isLive ? "🔴 فاتح" : "⚫ مغلق"}`);
                
            } catch (err) {
                console.log(`⚠️ فشل الفحص للستريمر (${cleanName}): ${err.message}`);
                // تحويل آمن للأوفلاين عند حدوث حظر أو خطأ
                await Streamer.updateOne(
                    { _id: streamer._id },
                    { $set: { isLive: false, viewers: 0 } }
                );
            }

            // انتظار 4 ثوانٍ بين كل ستريمر والآخر لتجنب كشف السيرفر
            await new Promise(r => setTimeout(r, 4000));
        }
    } catch (globalErr) {
        console.error("❌ خطأ عام في نظام التحديث:", globalErr.message);
    } finally {
        isUpdating = false;
        console.log("🏁 انتهت دورة الفحص الحالية.");
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
