const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});



client.once('ready', () => {
    console.log(`تم تشغيل البوت باسم: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // منع البوت من الرد على نفسه
    if (message.author.bot) return;

    const content = message.content.trim();
    const target = message.mentions.members.first();

    // التحقق إذا كتب الكلمة ومنشن شخص
    if (target) {
        // أمر البند (برجلي)
        if (content.startsWith('برجلي')) {
            if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                try {
                    await target.ban({ reason: `تبنيد بواسطة ${message.author.tag}` });
                    await message.reply(`✅ تم إعطاء الشخص باند وبرجلك برا السيرفر!`);
                } catch (error) {
                    await message.reply('❌ ما قدرت أبنّد الشخص، ممكن رتبته أعلى مني أو ما عندي صلاحيات.');
                }
            } else {
                await message.reply('🚫 هاذ لأمر مخصص للأدمن تراستر فقط.');
            }
        }

        // أمر التايم أوت (خنق)
        if (content.startsWith('خنق')) {
            if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                try {
                    // مدة 5 دقائق بالملي ثانية
                    await target.timeout(5 * 60 * 1000, `خنق بواسطة ${message.author.tag}`);
                    await message.reply(`🤫 تم إعطاء الشخص تايم أوت لمدة 5 دقائق.`);
                } catch (error) {
                    await message.reply('❌ فشلت عملية الخنق، تأكد من صلاحيات البوت.');
                }
            } else {
                await message.reply('🚫 لازم تكون أدمن عشان تخنق الناس!');
            }
        }
    }
});

client.login(process.env.TOKEN);
