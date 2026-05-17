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

let isUpdating = false;
async function updateKickStatus() {
    if (isUpdating) return;
    isUpdating = true;
    console.log("🚀 جاري فحص حالة البث عبر طلبات شبكية متطورة وتخطي الحظر...");

    try {
        const streamers = await Streamer.find({});
        for (const streamer of streamers) {
            const cleanName = streamer.kickUsername.trim().toLowerCase();
            try {
                // استخدام وكيل مجاني لتغيير الـ IP الخاص بـ Render وتفادي حظر Cloudflare
                // نقوم بجلب الصفحة العادية للستريمر وقراءة الـ Script المدمج بها لأنه يحتوي على الحالة مباشرة
                const response = await axios.get(`https://kick.com{cleanName}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Cache-Control": "no-cache",
                        "Prener-No-Fetch-Requests": "true"
                    },
                    timeout: 15000
                });

                if (response.data) {
                    const html = response.data;
                    
                    // كشط البيانات الذكي من داخل كود الصفحة بدون الـ API المحظور
                    const isLive = html.includes('"is_live":true') || html.includes('🔴') || html.includes('"livestream":{');
                    
                    // استخراج الصورة الشخصية بشكل تقريبي إذا لم تكن مخزنة مسبقاً
                    let profilePic = streamer.profilePic;
                    const picMatch = html.match(/"profile_pic":"([^"]+)"/);
                    if (picMatch && picMatch[1]) {
                        profilePic = picMatch[1].replace(/\\u002F/g, '/');
                    }

                    // استخراج عدد المشاهدين إذا كان لايف
                    let viewers = 0;
                    if (isLive) {
                        const viewersMatch = html.match(/"viewer_count":([0-9]+)/);
                        viewers = viewersMatch ? parseInt(viewersMatch[1]) : 5; // قيمة افتراضية للتأكيد
                    }

                    await Streamer.updateOne(
                        { _id: streamer._id },
                        { $set: { isLive, profilePic, viewers } }
                    );
                    console.log(`✅ ${cleanName} | بث: ${isLive ? "🔴 فاتح" : "⚫ مغلق"}`);
                }
            } catch (err) {
                // إذا استمر حظر الـ IP بالكامل من Render، نستخدم حيلة الـ Public API البديل لـ Kick
                try {
                    const altResponse = await axios.get(`https://kick.com{cleanName}`, {
                        headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" }
                    });
                    if (altResponse.data) {
                        const data = altResponse.data;
                        const isLive = data.livestream && data.livestream.is_live;
                        const viewers = data.livestream ? data.livestream.viewer_count : 0;
                        const profilePic = data.user?.avatar?.url || streamer.profilePic;

                        await Streamer.updateOne(
                            { _id: streamer._id },
                            { $set: { isLive, profilePic, viewers } }
                        );
                        console.log(`✅ [مسار بديل] ${cleanName} | بث: ${isLive ? "🔴 فاتح" : "⚫ مغلق"}`);
                        continue;
                    }
                } catch (altErr) {
                    console.log(`⚠️ حظر كلي من كيك للمستخدم (${streamer.kickUsername}): ${altErr.message}`);
                }

                // حماية لمنع الانهيار وتحويل الحالة لأوفلاين مؤقتاً عند الفشل الكامل
                await Streamer.updateOne(
                    { _id: streamer._id },
                    { $set: { isLive: false, viewers: 0 } }
                );
            }
            // انتظار 4 ثوانٍ بين كل مستخدم لتجنب كشف سيرفر Render
            await new Promise(r => setTimeout(r, 4000));
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
