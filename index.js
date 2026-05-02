const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, InteractionType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// مخازن
let autoLineBanner = null;
let pendingPurchases = new Map();
let shopConfig = { shopChannel: null, transferChannel: null, receiver: null, items: [] };

// تشغيل السيرفر لضمان بقاء البوت شغال (Render)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('البوت شغال 24/7 ✅'));
app.listen(process.env.PORT || 3000);

client.on('interactionCreate', async (interaction) => {

    // --- الأوامر (Slash Commands) ---
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'set-line') {
            const attachment = interaction.options.getAttachment('image');
            autoLineBanner = attachment ? attachment.url : null;
            await interaction.reply({ content: "✅ تم حفظ البنر!", ephemeral: true });
        }

        if (interaction.commandName === 'shop-setup') {
            shopConfig.shopChannel = interaction.options.getChannel('shop_channel').id;
            shopConfig.transferChannel = interaction.options.getChannel('transfer_channel').id;
            shopConfig.receiver = interaction.options.getUser('receiver').id;
            shopConfig.items = [];
            
            // جلب الرتب والأسعار (تأكد أن الأوامر مسجلة بـ 11 خيار)
            for (let i = 1; i <= 11; i++) {
                const role = interaction.options.getRole(`role${i}`);
                const price = interaction.options.getInteger(`price${i}`);
                if (role && price) {
                    shopConfig.items.push({ role, price });
                }
            }
            await interaction.reply({ content: "✅ تم إعداد المتجر", ephemeral: true });
        }
    }

    // --- القوائم المنسدلة (Select Menus) ---
    // تم إدخال هذا الجزء داخل interactionCreate لحل مشكلة الـ Syntax
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'buy_role_menu') {
            await interaction.deferReply({ ephemeral: true });

            const itemIndex = parseInt(interaction.values[0]);
            const selectedItem = shopConfig.items[itemIndex];

            if (!selectedItem || !selectedItem.role) {
                return interaction.editReply({ content: "❌ خطأ في جلب الرتبة" });
            }

            pendingPurchases.set(interaction.user.id, {
                roleId: selectedItem.role.id,
                price: selectedItem.price,
                roleName: selectedItem.role.name
            });

            // حساب الضريبة
            const taxPrice = Math.floor(selectedItem.price * (20 / 19) + 1);

            const embed = new EmbedBuilder()
                .setTitle("💳 طلب شراء رتبة")
                .setDescription(`**الرتبة:** <@&${selectedItem.role.id}>\n**السعر الصافي:** \`${selectedItem.price}\`\n**المبلغ المطلوب تحويله:**\n \`#credit <@${shopConfig.receiver}> ${taxPrice}\``)
                .setColor("Blue")
                .setFooter({ text: "سيتم إعطاء الرتبة تلقائياً بعد التحويل" });

            await interaction.editReply({ embeds: [embed] });
        }
    }
});

client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} متصل وجاهز!`);
    // ملاحظة: تأكد أن مصفوفة commands معرفة في مكان ما أو قم بتسجيلها يدوياً
});

// ================= نظام الدفع التلقائي =================
client.on('messageCreate', async (message) => {
    if (!shopConfig.transferChannel || message.channel.id !== shopConfig.transferChannel) return;
    
    // التأكد أن الرسالة من بروبوت
    if (message.author.id !== "282859044593598464") return; 

    if (!message.content.includes("has transferred")) return;

    // استخراج المبلغ والشخص المحول
    const amountMatch = message.content.match(/`(\d+)`/);
    const senderMatch = message.content.match(/<@!?(\d+)>/);

    if (!amountMatch || !senderMatch) return;

    const amountReceived = parseInt(amountMatch[1]);
    const senderId = senderMatch[1];

    const purchase = pendingPurchases.get(senderId);

    if (purchase) {
        // التأكد أن المبلغ المحول يغطي سعر الرتبة (بدون ضريبة بروبوت)
        if (amountReceived >= purchase.price) {
            try {
                const member = await message.guild.members.fetch(senderId);
                const role = message.guild.roles.cache.get(purchase.roleId);

                if (member && role) {
                    await member.roles.add(role);

                    const successEmbed = new EmbedBuilder()
                        .setTitle("✅ تم تسليم الرتبة تلقائياً")
                        .setDescription(`شكراً <@${senderId}>!\nتم إعطاؤك رتبة **${purchase.roleName}**`)
                        .setColor("Green")
                        .setTimestamp();

                    await message.channel.send({ embeds: [successEmbed] });
                    pendingPurchases.delete(senderId);
                }
            } catch (error) {
                console.error("خطأ في التسليم:", error);
                message.channel.send(`❌ <@${senderId}> حدث خطأ أثناء إعطاء الرتبة، تأكد من صلاحيات البوت.`).catch(() => {});
            }
        }
    }
});

client.login(process.env.TOKEN);
