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
    twitterUrl: { type: String, default: '' },
    isLive: { type: Boolean, default: false },
    viewers: { type: Number, default: 0 },
    profilePic: String
}));

const Application = mongoose.model('Application', new mongoose.Schema({
    kickUsername: String,
    discordName: String,
    status: { type: String, default: 'pending' }
}));

async function updateStatus() {
    console.log("🚀 جاري تحديث بيانات الستريمرز...");

    const streamers = await Streamer.find({});
    if (streamers.length === 0) return;

    for (const streamer of streamers) {

        try {

            const cleanName = streamer.kickUsername.trim().toLowerCase();

            const response = await axios.get(`https://kick.com/api/v1/channels/${cleanName}`);

            const data = response.data;

            const isLive = !!data.livestream;

            const viewers = data.livestream?.viewer_count || 0;

            const profilePic =
                data.user?.profile_pic ||
                data.user?.profile?.avatar ||
                "";

            await Streamer.updateOne(
                { _id: streamer._id },
                {
                    $set: {
                        isLive,
                        viewers,
                        profilePic
                    }
                }
            );

            console.log(`✅ ${cleanName} | LIVE: ${isLive} | VIEWERS: ${viewers}`);

        } catch (err) {
            console.log(`❌ ${streamer.kickUsername}: ${err.message}`);
        }
    }
}

// تحديث كل 5 دقائق
setInterval(updateStatus, 300000);
updateStatus();

// ================= ROUTES =================

app.get('/', async (req, res) => {
    try {
        const streamersData = await Streamer.find({}).sort({ isLive: -1, viewers: -1 }) || [];
        const stats = {
            totalStreamers: streamersData.length || 0,
            liveNow: streamersData.filter(s => s.isLive).length || 0,
            totalViewers: streamersData.reduce((a, b) => a + (b.viewers || 0), 0) || 0
        };
        res.render('index', { streamers: streamersData, services: streamersData, stats: stats });
    } catch (err) {
        res.status(500).send("Error loading home page");
    }
});

app.post('/apply', async (req, res) => {
    try {
        const { kickUser, discordName } = req.body;
        const clean = kickUser.trim();
        await Application.create({ kickUsername: clean, discordName });
        res.send("<script>alert('✅ تم إرسال طلبك!'); window.location='/';</script>");
    } catch (err) { res.status(500).send("Error applying"); }
});

app.get('/admin-justice', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌");
    const apps = await Application.find({ status: 'pending' });
    const streamers = await Streamer.find({});
    res.render('admin', { apps, streamers });
});

app.get('/admin/accept/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌");
    const appData = await Application.findByIdAndDelete(req.params.id);
    if (appData) {
        await Streamer.updateOne({ kickUsername: appData.kickUsername }, { $set: { kickUsername: appData.kickUsername } }, { upsert: true });
    }
    res.redirect('/admin-justice?pass=1234');
});

app.post('/admin/update-twitter/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌");
    await Streamer.findByIdAndUpdate(req.params.id, { twitterUrl: req.body.twitterUrl });
    res.redirect('/admin-justice?pass=1234');
});

app.get('/admin/delete-streamer/:id', async (req, res) => {
    if (req.query.pass !== "1234") return res.status(403).send("❌");
    await Streamer.findByIdAndDelete(req.params.id);
    res.redirect('/admin-justice?pass=1234');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 السيرفر يعمل على: ${PORT}`));
