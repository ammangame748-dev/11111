const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { fetch } = require('undici');

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
    console.log("🚀 جاري فحص حالة البث للقنوات المقبولة فقط...");

    try {
        const streamers = await Streamer.find({ status: 'approved' });
        for (const streamer of streamers) {
            const cleanName = streamer.kickUsername.trim().toLowerCase();
            try {
                // 🛠️ تم إصلاح طريقة دمج النصوص وطلب الـ API الصحيح عبر الخادم الوسيط
                const targetUrl = encodeURIComponent(`https://kick.com{cleanName}`);
                const response = await fetch(`https://allorigins.win{targetUrl}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "Accept": "application/json, text/plain, */*",
                        "Referer": "https://kick.com"
                    }
                });

                if (!response.ok) throw new Error(`خطأ في السيرفر الوسيط: ${response.status}`);

                const jsonRes = await response.json();
                if (jsonRes && jsonRes.contents) {
                    const data = JSON.parse(jsonRes.contents);
                    const isLive = !!data.livestream;
                    const viewers = data.livestream?.viewer_count || 0;
                    const profilePic = data.user?.profile_pic || data.user?.profile?.avatar || streamer.profilePic;

                    await Streamer.updateOne(
                        { _id: streamer._id },
                        { $set: { isLive, profilePic, viewers } }
                    );
                    console.log(`✅ ${cleanName} | بث: ${isLive ? "🔴 فاتح" : "⚫ مغلق"}`);
                }
            } catch (err) {
                console.log(`⚠️ فشل الفحص للستريمر (${cleanName}): ${err.message}`);
                await Streamer.updateOne({ _id: streamer._id }, { $set: { isLive: false, viewers: 0 } });
            }
            await new Promise(r => setTimeout(r, 4000));
        }
    } catch (globalErr) {
        console.error("❌ خطأ في نظام التحديث:", globalErr.message);
    } finally {
        isUpdating = false;
    }
}

setInterval(updateKickStatus, 300000); // 5 دقائق لحماية نظامك من الحظر والتوقف الدوري
setTimeout(updateKickStatus, 3000);

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

app.post('/apply', async (req, res) => {
    try {
        const { kickUser } = req.body;
        if (!kickUser) return res.status(400).send("الاسم مطلوب");
        await Streamer.create({ kickUsername: kickUser.trim() });
        res.send("<script>alert('تم إرسال طلبك بنجاح وينتظر موافقة الإدارة!'); window.location='/';</script>");
    } catch (err) {
        res.status(500).send("الاسم مضاف سابقاً أو حدث خطأ");
    }
});

app.post('/add-streamer', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).send("الاسم مطلوب");
        await Streamer.create({ kickUsername: username.trim(), status: 'approved' });
        res.send("<script>alert('تم إضافة الستريمر بنجاح!'); window.location='/';</script>");
        setTimeout(updateKickStatus, 1000);
    } catch (err) {
        res.status(500).send("الاسم مضاف سابقاً أو حدث خطأ");
    }
});

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

app.post('/admin-justice/approve/:id', async (req, res) => {
    try {
        await Streamer.findByIdAndUpdate(req.params.id, { $set: { status: 'approved' } });
        res.redirect('/admin-justice');
        setTimeout(updateKickStatus, 1000);
    } catch (err) {
        res.status(500).send("حدث خطأ أثناء القبول");
    }
});

app.post('/admin-justice/reject/:id', async (req, res) => {
    try {
        await Streamer.findByIdAndDelete(req.params.id); 
        res.redirect('/admin-justice');
    } catch (err) {
        res.status(500).send("حدث خطأ أثناء الرفض");
    }
});

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
