const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, InteractionType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// مخازن
let autoLineBanner = null;
let pendingPurchases = new Map();
let roleMenuRoles = [];
let shopConfig = { shopChannel: null, transferChannel: null, receiver: null, items: [] };
let lastTicketImage = null, lastTicketEmoji = null;
let lastRenameImage = null, lastRenameEmoji = null;

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('البوت شغال 24/7 ✅'));
app.listen(process.env.PORT || 3000);
client.on('interactionCreate', async (interaction) => {

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'set-line') {
            autoLineBanner = interaction.options.getAttachment('image').url;
            await interaction.reply({ content: "✅ تم حفظ البنر!", ephemeral: true });
        }

        if (interaction.commandName === 'shop-setup') {
            shopConfig.shopChannel = interaction.options.getChannel('shop_channel').id;
            shopConfig.transferChannel = interaction.options.getChannel('transfer_channel').id;
            shopConfig.receiver = interaction.options.getUser('receiver').id;
            shopConfig.items = [];
            for (let i = 1; i <= 11; i++) {
                shopConfig.items.push({
                    role: interaction.options.getRole(`role${i}`),
                    price: interaction.options.getInteger(`price${i}`)
                });
            }
            await interaction.reply({ content: "✅ تم إعداد المتجر", ephemeral: true });
        }
    }
});
// Select Menus
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

            const taxPrice = Math.floor(selectedItem.price * (20 / 19) + 1);

            const embed = new EmbedBuilder()
                .setTitle("💳 طلب شراء رتبة")
                .setDescription(`**الرتبة:** ${selectedItem.role}\n**السعر الصافي:** \`${selectedItem.price}\`\n**المبلغ المطلوب:** \`${taxPrice}\``)
                .setColor("Blue")
                .setFooter({ text: "سيتم إعطاء الرتبة تلقائياً بعد التحويل" });

            await interaction.editReply({ embeds: [embed] });
        }

        // باقي Select Menus (role_menu_select , open_t_menu , rename_select , ticket_actions) 
        // انسخها من كودك القديم
    }
    client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} متصل وجاهز!`);

    try {
        await client.application.commands.set(commands);
        console.log('✅ تم تحديث الأوامر بنجاح!');
    } catch (error) {
        console.error('❌ فشل تحديث الأوامر:', error);
    }
});
// ================= نظام الدفع التلقائي =================
client.on('messageCreate', async (message) => {
    if (!shopConfig.transferChannel || message.channel.id !== shopConfig.transferChannel) return;
    if (message.author.id !== "282859044593598464") return; // ProBot ID

    if (!message.content.includes("has transferred")) return;

    const amountMatch = message.content.match(/\$(\d+)/) || message.content.match(/`(\d+)`/) || message.content.match(/(\d+)/);
    const senderMatch = message.content.match(/<@!?(\d+)>/);

    if (!amountMatch || !senderMatch) return;

    const amountReceived = parseInt(amountMatch[1]);
    const senderId = senderMatch[1];

    const purchase = pendingPurchases.get(senderId);

    if (purchase && amountReceived >= purchase.price) {
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
            console.error("خطأ:", error);
            message.channel.send(`❌ <@${senderId}> حدث خطأ أثناء إعطاء الرتبة.`).catch(() => {});
        }
    }
});
