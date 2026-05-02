const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder, 
    TextInputStyle, StringSelectMenuBuilder, InteractionType 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// مخازن مؤقتة للبيانات
let autoLineBanner = null;
let pendingPurchases = new Map(); // لحفظ مين اختار شو
let roleMenuRoles = [];
let shopConfig = {
    shopChannel: null,
    transferChannel: null,
    receiver: null,
    items: []
};
let roleMenuMessage = null;
let lastTicketImage = null, lastTicketEmoji = null;
let lastRenameImage = null, lastRenameEmoji = null;
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('البوت شغال 24/7 ✅');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Web Server is running on port ${port}`);
});

    const commands = [
        {
            name: 'set-line',
            description: 'تحديد بنر الخط التلقائي (ارفع صورة)',
            options: [
                { name: 'image', description: 'ارفع صورة الخط', type: 11, required: true }
            ]
        },

        {
            name: 'role-menu',
            description: 'إنشاء منيو رتب (8 رتب)',
            options: [
                { name: 'role1', type: 8, description: 'الرتبة الأولى', required: true },
                { name: 'role2', type: 8, description: 'الرتبة الثانية', required: true },
                { name: 'role3', type: 8, description: 'الرتبة الثالثة', required: true },
                { name: 'role4', type: 8, description: 'الرتبة الرابعة', required: true },
                { name: 'role5', type: 8, description: 'الرتبة الخامسة', required: true },
                { name: 'role6', type: 8, description: 'الرتبة السادسة', required: true },
                { name: 'role7', type: 8, description: 'الرتبة السابعة', required: true },
                { name: 'role8', type: 8, description: 'الرتبة الثامنة', required: true },
                { name: 'title', type: 3, description: 'عنوان الإيمباد', required: false }
            ]
        },

        {
            name: 'setup-ticket',
            description: 'إعداد بانل التذاكر (منيو)',
            options: [
                { name: 'image', description: 'ارفع صورة للبانل', type: 11, required: true },
                { name: 'emoji_id', description: 'ضع ID الإيموجي للمنيو', type: 3, required: true }
            ]
        },
        {
            name: 'setup-rename',
            description: 'إعداد قائمة تغيير الأسماء (منيو)',
            options: [
                { name: 'image', description: 'ارفع صورة للإيمباد', type: 11, required: true },
                { name: 'emoji', description: 'ضع الإيموجي للمنيو', type: 3, required: true }
            ]
        },
        {
            name: 'ban',
            description: 'طرد نهائي (باند)',
            options: [
                { name: 'user', description: 'العضو المراد حظره', type: 6, required: true },
                { name: 'reason', description: 'سبب الحظر', type: 3, required: false }
            ]
        },
        {
            name: 'timeout',
            description: 'تايم آوت',
            options: [
                { name: 'user', description: 'العضو المراد إعطاؤه وقت', type: 6, required: true },
                { name: 'duration', description: 'المدة بالدقائق', type: 4, required: true }
            ]
        },
        {
            name: 'shop-setup',
            description: 'إعداد متجر الرتب (11 رتبة)',
            options: [
                { name: 'shop_channel', type: 7, description: 'روم المتجر', required: true },
                { name: 'transfer_channel', type: 7, description: 'روم التحويل', required: true },
                { name: 'receiver', type: 6, description: 'المستلم للكريديت', required: true },
{ name: 'role1', type: 8, description: 'الرتبة 1', required: true },
{ name: 'price1', type: 4, description: 'سعر 1', required: true },

{ name: 'role2', type: 8, description: 'الرتبة 2', required: true },
{ name: 'price2', type: 4, description: 'سعر 2', required: true },

{ name: 'role3', type: 8, description: 'الرتبة 3', required: true },
{ name: 'price3', type: 4, description: 'سعر 3', required: true },

{ name: 'role4', type: 8, description: 'الرتبة 4', required: true },
{ name: 'price4', type: 4, description: 'سعر 4', required: true },

{ name: 'role5', type: 8, description: 'الرتبة 5', required: true },
{ name: 'price5', type: 4, description: 'سعر 5', required: true },

{ name: 'role6', type: 8, description: 'الرتبة 6', required: true },
{ name: 'price6', type: 4, description: 'سعر 6', required: true },

{ name: 'role7', type: 8, description: 'الرتبة 7', required: true },
{ name: 'price7', type: 4, description: 'سعر 7', required: true },

{ name: 'role8', type: 8, description: 'الرتبة 8', required: true },
{ name: 'price8', type: 4, description: 'سعر 8', required: true },

{ name: 'role9', type: 8, description: 'الرتبة 9', required: true },
{ name: 'price9', type: 4, description: 'سعر 9', required: true },

{ name: 'role10', type: 8, description: 'الرتبة 10', required: true },
{ name: 'price10', type: 4, description: 'سعر 10', required: true },

{ name: 'role11', type: 8, description: 'الرتبة 11', required: true },
{ name: 'price11', type: 4, description: 'سعر 11', required: true },
               
            ]
        },
                {
            name: 'shop',
            description: 'نشر متجر الرتب مع إيمباد مخصص',
            options: [
                { name: 'description', type: 3, description: 'وصف المتجر (الكلام اللي رح ينكتب)', required: true },
                { name: 'image', type: 11, description: 'ارفع صورة البنر للمتجر', required: false }
            ]
        }

    ];

// منع الكراش
process.on('unhandledRejection', error => { console.error('Error:', error); });

// نظام الخط التلقائي
client.on('messageCreate', async (message) => {
    if (message.content === '-خط' && autoLineBanner) {
        try {
            await message.delete();
            await message.channel.send({ files: [autoLineBanner] });
        } catch (e) {}
    }
        if (message.author.bot || !message.guild) return;
    
    // التأكد أن الشخص اللي كتب الأمر عنده صلاحية إدارة القنوات
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;

    // --- قفل وفتح (ق / ف) مع حذف رسالة البوت ---
    if (message.content === 'ق') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
        await message.delete().catch(() => {});
        message.channel.send("🔒 **تم قفل القناة.**").then(msg => setTimeout(() => msg.delete(), 100));
    }

    if (message.content === 'ف') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: true });
        await message.delete().catch(() => {});
        message.channel.send("🔓 **تم فتح القناة.**").then(msg => setTimeout(() => msg.delete(), 100));
    }

    // --- إخفاء وإظهار (hi / ih) مع حذف رسالة البوت ---
    if (message.content === 'hi') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        await message.channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: false });
        await message.delete().catch(() => {});
        message.channel.send("👻 **تم إخفاء القناة.**").then(msg => setTimeout(() => msg.delete(), 100));
    }

    if (message.content === 'ih') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        await message.channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: true });
        await message.delete().catch(() => {});
        message.channel.send("👁️ **تم إظهار القناة.**").then(msg => setTimeout(() => msg.delete(), 100));
    }

    // --- أمر مسح الرسائل السريع (م + عدد) ---
    if (message.content.startsWith('م')) {
        // التأكد من أن الشخص لديه صلاحية إدارة الرسائل
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        const amount = parseInt(message.content.slice(1)); // استخراج الرقم من بعد حرف "م"

        // إذا لم يتم وضع رقم صحيح
        if (isNaN(amount) || amount <= 0) return;

        // الحد الأقصى للمسح دفعة واحدة هو 100
        if (amount > 100) {
            return message.reply("⚠️ لا يمكنك مسح أكثر من 100 رسالة.").then(msg => {
                setTimeout(() => msg.delete(), 100);
                setTimeout(() => message.delete(), 100);
            });
        }

        try {
            // نمسح عدد الرسائل المطلوبة + رسالة الأمر (م)
            await message.channel.bulkDelete(amount + 1, true);
            
            // إرسال رسالة تأكيد وحذفها بعد 3 ثوانٍ
            const successMsg = await message.channel.send(`✅ تم تطهير الشات ومسح **${amount}** رسالة.`);
            setTimeout(() => successMsg.delete().catch(() => {}), 3000);
        } catch (e) {
            console.error("خطأ في المسح:", e);
            message.reply("❌ لا يمكن مسح رسائل قديمة جداً (أكثر من 14 يوم).")
                .then(msg => setTimeout(() => { msg.delete(); message.delete(); }, 100));
        }
    }

});
client.on('interactionCreate', async (interaction) => {

    // ================= CHAT INPUT COMMANDS =================
    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'set-line') {
            autoLineBanner = interaction.options.getAttachment('image').url;
            await interaction.reply({ content: "✅ تم حفظ البنر بنجاح!", ephemeral: true });
        }

        if (interaction.commandName === 'role-menu') {

            roleMenuRoles = [
                interaction.options.getRole('role1'),
                interaction.options.getRole('role2'),
                interaction.options.getRole('role3'),
                interaction.options.getRole('role4'),
                interaction.options.getRole('role5'),
                interaction.options.getRole('role6'),
                interaction.options.getRole('role7'),
                interaction.options.getRole('role8'),
            ];

            const title = interaction.options.getString('title') || 'Role Menu';

            const menu = new StringSelectMenuBuilder()
                .setCustomId('role_menu_select')
                .setPlaceholder('اختر رتبتك')
                .addOptions(
                    roleMenuRoles.map(role => ({
                        label: role.name,
                        value: role.id
                    }))
                );

            const row = new ActionRowBuilder().addComponents(menu);

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription('اختر الرتبة من القائمة')
                .setColor('Blue');

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }

        if (interaction.commandName === 'setup-ticket') {
            lastTicketImage = interaction.options.getAttachment('image').url;
            lastTicketEmoji = interaction.options.getString('emoji_id');

            const modal = new ModalBuilder()
                .setCustomId('t_setup')
                .setTitle('إعداد التذكرة');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('t_msg')
                        .setLabel("محتوى الإيمباد")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

            await interaction.showModal(modal);
        }

        if (interaction.commandName === 'setup-rename') {
            lastRenameImage = interaction.options.getAttachment('image').url;
            lastRenameEmoji = interaction.options.getString('emoji');

            const modal = new ModalBuilder()
                .setCustomId('r_setup')
                .setTitle('إعداد قائمة الأسماء');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('r_msg')
                        .setLabel("وصف القائمة")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

            await interaction.showModal(modal);
        }

        if (interaction.commandName === 'ban' || interaction.commandName === 'timeout') {
            const user = interaction.options.getMember('user');

            try {
                if (interaction.commandName === 'ban') {
                    await user.ban();
                    await interaction.reply(`✅ طردنا ${user.user.tag}`);
                } else {
                    await user.timeout(interaction.options.getInteger('duration') * 60000);
                    await interaction.reply("✅ تم التايم آوت");
                }
            } catch (e) {
                await interaction.reply({ content: "❌ رتبته أعلى مني!", ephemeral: true });
            }
        }

        if (interaction.commandName === 'shop-setup') {
            await interaction.deferReply({ flags: [64] });

            try {
                shopConfig.shopChannel = interaction.options.getChannel('shop_channel').id;
                shopConfig.transferChannel = interaction.options.getChannel('transfer_channel').id;
                shopConfig.receiver = interaction.options.getUser('receiver').id;

                shopConfig.items = [];

                for (let i = 1; i <= 11; i++) {
                    const role = interaction.options.getRole(`role${i}`);
                    const price = interaction.options.getInteger(`price${i}`);
                    
                    if (role && price !== null) {
                        shopConfig.items.push({
                            role: role,
                            price: price
                        });
                    }
                }

                await interaction.editReply({ content: `✅ تم إعداد المتجر بنجاح! عدد الرتب المسجلة: ${shopConfig.items.length}` });
            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: "❌ حدث خطأ أثناء الإعداد." });
            }
        }

        if (interaction.commandName === 'shop') {
            if (!shopConfig.shopChannel || shopConfig.items.length === 0) {
                return interaction.reply({ content: "⚠️ لازم تسوي setup أول", ephemeral: true });
            }

            const userDescription = interaction.options.getString('description');
            const userImage = interaction.options.getAttachment('image');

            const shopEmbed = new EmbedBuilder()
                .setTitle("🛒 متجر الرتب")
                .setDescription(userDescription)
                .setColor("Gold");

            if (userImage) shopEmbed.setImage(userImage.url);

            const menu = new StringSelectMenuBuilder()
                .setCustomId('buy_role_menu')
                .setPlaceholder('اختر رتبة')
                .addOptions(
                    shopConfig.items.map((item, index) => ({
                        label: item.role.name,
                        description: `السعر: ${item.price}`,
                        value: `${index}`
                    }))
                );

            const row = new ActionRowBuilder().addComponents(menu);
            const channel = interaction.guild.channels.cache.get(shopConfig.shopChannel);
            
            await channel.send({ embeds: [shopEmbed], components: [row] });
            await interaction.reply({ content: "✅ تم نشر المتجر", ephemeral: true });
        }
    }

    // ================= MODALS =================
    if (interaction.type === InteractionType.ModalSubmit) {

        if (interaction.customId === 't_setup') {
            const embed = new EmbedBuilder()
                .setDescription(interaction.fields.getTextInputValue('t_msg'))
                .setColor("Blue");

            if (lastTicketImage) embed.setImage(lastTicketImage);

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('open_t_menu')
                    .setPlaceholder('فتح تذكرة')
                    .addOptions([
                        { label: 'فتح تذكرة', value: 'create_ticket', emoji: lastTicketEmoji }
                    ])
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: "✅ تم", ephemeral: true });
        }

        if (interaction.customId === 'r_setup') {
            const embed = new EmbedBuilder()
                .setDescription(interaction.fields.getTextInputValue('r_msg'))
                .setImage(lastRenameImage)
                .setColor("Purple");

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('rename_select')
                    .setPlaceholder('تغيير الاسم')
                    .addOptions([
                        { label: 'تغيير الاسم', value: 'go', emoji: lastRenameEmoji }
                    ])
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: "✅ تم", ephemeral: true });
        }
    }

    // ================= SELECT MENUS =================
    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === 'role_menu_select') {
            await interaction.deferReply({ flags: [64] });
            const member = interaction.member;
            const selectedRoleId = interaction.values[0];

            try {
                const menuRoleIds = roleMenuRoles.map(r => r.id);
                await member.roles.remove(menuRoleIds);
                await member.roles.add(selectedRoleId);
                await interaction.editReply({ content: "✅ تم إعطاء الرتبة" });
            } catch {
                await interaction.editReply({ content: "❌ خطأ بالرتب" });
            }
        }

        if (interaction.customId === 'buy_role_menu') {
            await interaction.deferReply({ flags: [64] });

            const itemIndex = parseInt(interaction.values[0]);
            const selectedItem = shopConfig.items[itemIndex];

            pendingPurchases.set(interaction.user.id, {
                roleId: selectedItem.role.id,
                price: selectedItem.price
            });

            const receiverId = shopConfig.receiver; 
            const taxPrice = Math.floor(selectedItem.price * (20 / 19) + 1);

            const embed = new EmbedBuilder()
                .setDescription(`\`#credit <@${receiverId}> ${taxPrice}\``)
                .setColor("Blue");

            await interaction.editReply({ embeds: [embed] });
        }
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {
        if (interaction.customId === 'close_t') {
            await interaction.reply("جاري الإغلاق...");
            setTimeout(() => interaction.channel.delete(), 3000);
        }
    }

});

client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} متصل وجاهز!`);
    try {
        await client.application.commands.set(commands);
        console.log('✅ تم تحديث أوامر السلاش بنجاح!');
    } catch (error) {
        console.error('❌ فشل تحديث الأوامر:', error);
    }
});

client.on('messageCreate', async (message) => {
    if (!shopConfig.transferChannel || message.channel.id !== shopConfig.transferChannel) return;
    if (message.author.id !== "282859044593598464") return;

    if (message.content.includes("has transferred") && (message.content.includes(`<@${shopConfig.receiver}>`) || message.content.includes(shopConfig.receiver))) {
        const amountMatch = message.content.match(/\$(\d+)/) || message.content.match(/`(\d+)`/);
        const senderMatch = message.content.match(/<@!?(\d+)>/);

        if (amountMatch && senderMatch) {
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
                            .setDescription(`شكراً لك <@${senderId}>، تم إعطاؤك رتبة **${role.name}** بنجاح.`)
                            .setColor("Green");
                        await message.channel.send({ embeds: [successEmbed] });
                        pendingPurchases.delete(senderId);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
});

client.login(process.env.TOKEN);
