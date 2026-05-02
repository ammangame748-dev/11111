const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    EmbedBuilder
} = require('discord.js');

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ====== تخزين الطلبات ======
const pendingPurchases = new Map();

// ====== أمر /shop ======
const commands = [
    new SlashCommandBuilder()
        .setName('shop')
        .setDescription('شراء رتبة')
        .addUserOption(option =>
            option.setName('receiver')
                .setDescription('الشخص الذي سيتم التحويل له')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('الرتبة')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('السعر')
                .setRequired(true))
].map(cmd => cmd.toJSON());

// ====== تسجيل الأوامر ======
client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} شغال!`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
    );

    console.log('✅ تم تسجيل أمر /shop');
});

// ====== تنفيذ /shop ======
client.on('interactionCreate', async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'shop') {

        const receiver = interaction.options.getUser('receiver');
        const role = interaction.options.getRole('role');
        const price = interaction.options.getInteger('price');

        // تخزين الطلب
        pendingPurchases.set(interaction.user.id, {
            roleId: role.id,
            price: price,
            receiverId: receiver.id
        });

        await interaction.reply({
            content:
                `💸 لتحصل على رتبة **${role.name}**\n` +
                `حوّل ${price}$ إلى <@${receiver.id}>`,
            ephemeral: true
        });
    }
});


// ====== نظام كشف التحويل ======
client.on('messageCreate', async (message) => {

    if (message.author.id !== "282859044593598464") return; // بروبوت فقط

    const content = message.content;

    const isTransfer =
        content.includes("قام بتحويل") ||
        content.includes("has transferred");

    if (!isTransfer) return;

    const numbers = content.match(/\d+/g);
    const mentions = content.match(/\d{17,19}/g);

    if (!numbers || !mentions) return;

    const amount = parseInt(numbers.find(n => n.length < 10));
    if (!amount) return;

    // نحدد المشتري
    const buyerId = mentions.find(id => pendingPurchases.has(id));
    if (!buyerId) return;

    const purchase = pendingPurchases.get(buyerId);

    // تحقق من الشخص المستلم (من السلاش)
    if (!mentions.includes(purchase.receiverId)) return;

    // تحقق من السعر
    if (amount < purchase.price * 0.95) return;

    try {
        const member = await message.guild.members.fetch(buyerId);
        const role = message.guild.roles.cache.get(purchase.roleId);

        if (!member || !role) return;

        // ===== يعطي الرتبة فوراً =====
        await member.roles.add(role);

        await message.reply(
            `✅ <@${buyerId}> تم إعطاؤك رتبة **${role.name}**`
        );

        pendingPurchases.delete(buyerId);

    } catch (err) {
        console.error(err);
        message.reply("❌ تأكد أن رتبة البوت أعلى من الرتبة");
    }
});

client.login(process.env.TOKEN);
