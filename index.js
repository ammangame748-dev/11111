const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hsamhmaydh4_db_user:xls5Av4Nr4a5PA7W@cluster0.wjnh8d0.mongodb.net/BlackListDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ متصل بقاعدة البيانات بنجاح'))
    .catch(err => console.error('❌ خطأ قاعدة البيانات:', err));

const Streamer = mongoose.model('KickConfig', new mongoose.Schema({
    kickUsername: { type: String, required: true, unique: true },
    isLive: { type: Boolean, default: false },
    profilePic: { type: String, default: '' },
    viewers: { type: Number, default: 0 },
    twitterUrl: { type: String, default: '' },
    kickUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}));

let isUpdating = false;
async function updateKickStatus() {
    if (isUpdating) return;
    isUpdating = true;
    console.log("🚀 جاري فحص حالة البث باستخدام متصفح Puppeteer الحقيقي لتخطي الحظر...");

    let browser = null;
    try {
        const streamers = await Streamer.find({ status: 'approved' });
        if (streamers.length === 0) {
            isUpdating = false;
            return;
        }

        // تشغيل المتصفح بالإعدادات المناسبة لخادم Render المحدود
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // تغيير الـ User Agent لتبدو كمتصفح حقيقي بالكامل
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        for (const streamer of streamers) {
            const cleanName = streamer.kickUsername.trim().toLowerCase();
            try {
                // الدخول إلى رابط الـ API الخاص بالقناة مباشرة
                await page.goto(`https://kick.com{cleanName}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 20000
                });

                // استخراج النص من داخل الصفحة (محتوى الـ JSON)
                const content = await page.evaluate(() => document.querySelector('body').innerText);
                
                const data = JSON.parse(content);
                
                if (data && data.user) {
                    const isLive = !!data.livestream;
                    const viewers = data.livestream?.viewer_count || 0;
                    const profilePic = data.user?.profile_pic || data.user?.profile?.avatar || streamer.profilePic || '/black.png';

                    await Streamer.updateOne(
                        { _id: streamer._id },
                        { $set: { isLive, profilePic, viewers } }
                    );
                    console.log(`✅ ${cleanName} | بث: ${isLive ? "🔴 فاتح" : "⚫ مغلق"} | المشاهدات: ${viewers}`);
                } else {
                    throw new Error("بنية البيانات المستلمة غير صحيحة أو الحساب غير موجود");
                }
            } catch (err) {
                console.log(`⚠️ فشل الفحص للستريمر (${cleanName}): ${err.message}`);
                await Streamer.updateOne(
                    { _id: streamer._id },
                    { $set: { isLive: false, viewers: 0 } }
                );
            }
            // انتظار 3 ثوانٍ قبل فحص الحساب التالي لحماية المتصفح من الضغط
            await new Promise(r => setTimeout(r, 3000));
        }
    } catch (globalErr) {
        console.error("❌ خطأ عام في نظام التحديث الذكي:", globalErr.message);
    } finally {
        if (browser) {
            await browser.close().catch(e => console.error("خطأ إغلاق المتصفح:", e.message));
        }
        isUpdating = false;
        console.log("🏁 انتهت دورة الفحص للمتصفح.");
    }
}

// الفحص كل 5 دقائق (300000ms) لمنع استهلاك الرام في Render مجاناً
setInterval(updateKickStatus, 30000);
setTimeout(updateKickStatus, 3000);

// الصفحة الرئيسية
app.get('/', async (req, res) => {
    try {
        const streamersData = await Streamer.find({ status: 'approved' }).sort({ isLive: -1 });
        const totalStreamers = streamersData.length;
        const liveNow = streamersData.filter(s => s.isLive).length;
        const totalViewers = streamersData.reduce((acc, curr) => acc + (curr.viewers || 0), 0);

        res.render('index', {
            streamers: streamersData,
            stats: { totalStreamers, totalViewers, liveNow }
        });
    } catch (err) {
        res.status(500).send("خطأ في السيرفر");
    }
});

// التقديم للموقع
app.post('/apply', async (req, res) => {
    try {
        const { kickUser } = req.body;
        if (!kickUser) return res.status(400).send("الاسم مطلوب");
        
        const cleanName = kickUser.trim();
        const exists = await Streamer.findOne({ kickUsername: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
        if (exists) {
            return res.send("<script>alert('هذا الحساب مسجل لدينا بالفعل!'); window.location='/';</script>");
        }

        await Streamer.create({ kickUsername: cleanName });
        res.send("<script>alert('تم إرسال طلبك بنجاح وينتظر موافقة الإدارة!'); window.location='/';</script>");
    } catch (err) {
        res.status(500).send("حدث خطأ في السيرفر");
    }
});

// إضافة مباشرة
app.post('/add-streamer', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).send("الاسم مطلوب");
        
        const cleanName = username.trim();
        const exists = await Streamer.findOne({ kickUsername: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
        if (exists) {
            return res.send("<script>alert('الستريمر مضاف مسبقاً!'); window.location='/admin-justice';</script>");
        }

        await Streamer.create({ kickUsername: cleanName, status: 'approved' });
        res.send("<script>alert('تم إضافة الستريمر بنجاح!'); window.location='/admin-justice';</script>");
        setTimeout(updateKickStatus, 1000);
    } catch (err) {
        res.status(500).send("حدث خطأ أثناء الإضافة");
    }
});

// لوحة الأدمن
app.get('/admin-justice', async (req, res) => {
    try {
        const approvedStreamers = await Streamer.find({ status: 'approved' });
        const pendingRequests = await Streamer.find({ status: 'pending' });

        res.render('admin', {
            streamers: approvedStreamers,
            apps: pendingRequests
        });
    } catch (err) {
        res.status(500).send("خطأ في تحميل لوحة التحكم");
    }
});

// قبول القناة
app.post('/admin-justice/approve/:id', async (req, res) => {
    try {
        await Streamer.findByIdAndUpdate(req.params.id, { $set: { status: 'approved' } });
        res.redirect('/admin-justice');
        setTimeout(updateKickStatus, 1000);
    } catch (err) {
        res.status(500).send("حدث خطأ أثناء القبول");
    }
});

// رفض القناة
app.post('/admin-justice/reject/:id', async (req, res) => {
    try {
        await Streamer.findByIdAndDelete(req.params.id); 
        res.redirect('/admin-justice');
    } catch (err) {
        res.status(500).send("حدث خطأ أثناء الرفض");
    }
});

// تعديل الروابط
app.post('/admin-justice/update-links/:id', async (req, res) => {
    try {
        const { kickUrl, twitterUrl } = req.body;
        await Streamer.findByIdAndUpdate(req.params.id, { $set: { kickUrl, twitterUrl } });
        res.redirect('/admin-justice');
    } catch (err) {
        res.status(500).send("حدث خطأ أثناء التحديث");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 السيرفر يعمل على منفذ: ${PORT}`));
