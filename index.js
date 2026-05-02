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
            shopConfig.shopChannel = interaction.options.getChannel('shop_channel').id;
            shopConfig.transferChannel = interaction.options.getChannel('transfer_channel').id;
            shopConfig.receiver = interaction.options.getUser('receiver').id;

            shopConfig.items = [];

            // تعديل الرقم هنا من 15 إلى 11
            for (let i = 1; i <= 11; i++) {
                shopConfig.items.push({
                    role: interaction.options.getRole(`role${i}`),
                    price: interaction.options.getInteger(`price${i}`)
                });
            }

            await interaction.reply({ content: "✅ تم إعداد المتجر بـ 11 رتبة بنجاح", ephemeral: true });
        }

    }
          if (interaction.commandName === 'shop') {
            if (!shopConfig.shopChannel || shopConfig.items.length === 0) {
                return interaction.reply({ content: "⚠️ يجب إعداد المتجر أولاً باستخدام `/shop-setup`", ephemeral: true });
            }

            // جلب البيانات المخصصة من الأمر
            const userDescription = interaction.options.getString('description');
            const userImage = interaction.options.getAttachment('image');

            const shopEmbed = new EmbedBuilder()
                .setTitle("🛒 متجر الرتب")
                .setDescription(userDescription) // الوصف اللي كتبته بالأمر
                .setColor("Gold");

            // إذا رفعت صورة، البوت رح يحطها بالإيمباد
            if (userImage) shopEmbed.setImage(userImage.url);

            const menu = new StringSelectMenuBuilder()
                .setCustomId('buy_role_menu')
                .setPlaceholder('اختر رتبة للشراء')
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
            await interaction.reply({ content: "✅ تم نشر المتجر المخصص بنجاح!", ephemeral: true });
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
                    .setPlaceholder('اضغط هنا لفتح تذكرة')
                    .addOptions([
                        { label: 'فتح تذكرة جديدة', value: 'create_ticket', emoji: lastTicketEmoji }
                    ])
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: "✅ تم النشر", ephemeral: true });
        }

        if (interaction.customId === 'r_setup') {
            const embed = new EmbedBuilder()
                .setDescription(interaction.fields.getTextInputValue('r_msg'))
                .setImage(lastRenameImage)
                .setColor("Purple");

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('rename_select')
                    .setPlaceholder('اختر لتغيير اسمك')
                    .addOptions([
                        { label: 'تغيير الاسم المستعار', value: 'go', emoji: lastRenameEmoji }
                    ])
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: "✅ تم النشر", ephemeral: true });
        }

        if (interaction.customId === 'actual_name_change') {
            const name = interaction.fields.getTextInputValue('new_name');
            try {
                await interaction.member.setNickname(name);
                await interaction.reply({ content: `✅ صار اسمك: ${name}`, ephemeral: true });
            } catch {
                await interaction.reply({ content: "❌ لا أستطيع تغيير اسمك!", ephemeral: true });
            }
        }

        if (interaction.customId === 'modal_rename_ch') {
            await interaction.channel.setName(interaction.fields.getTextInputValue('new_ch_name'));
            await interaction.reply({ content: `✅ تم تغيير اسم التذكرة`, ephemeral: true });
        }

        if (interaction.customId === 'modal_add_user') {
            const id = interaction.fields.getTextInputValue('user_id');
            await interaction.channel.permissionOverwrites.create(id, { ViewChannel: true, SendMessages: true });
            await interaction.reply({ content: `✅ تم إضافة <@${id}> للتذكرة.` });
        }

        if (interaction.customId === 'modal_remove_user') {
            const id = interaction.fields.getTextInputValue('user_id');
            await interaction.channel.permissionOverwrites.delete(id);
            await interaction.reply({ content: `✅ تم إزالة <@${id}> من التذكرة.` });
        }
    }

    // ================= SELECT MENUS =================
    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === 'open_t_menu') {

            const ch = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ],
            });

            await interaction.reply({ content: `تذكرتك: ${ch}`, ephemeral: true });

            const eb = new EmbedBuilder()
                .setTitle("🎫 تذكرة جديدة")
                .setDescription(`مرحباً ${interaction.user}`)
                .setColor("Green");

            if (lastTicketImage) eb.setImage(lastTicketImage);

            const r1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_t').setLabel('استلام').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('close_t').setLabel('إغلاق').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('call_owner').setLabel('منشن صاحبها').setStyle(ButtonStyle.Secondary)
            );

            const r2 = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_actions')
                    .setPlaceholder('خيارات التذكرة')
                    .addOptions([
                        { label: 'إضافة شخص', value: 'add_user', emoji: '➕' },
                        { label: 'إزالة شخص', value: 'remove_user', emoji: '➖' },
                        { label: 'تغيير اسم', value: 'rename_t', emoji: '📝' }
                    ])
            );

            await ch.send({ embeds: [eb], components: [r1, r2] });
        }

if (interaction.customId === 'role_menu_select') {
    const member = interaction.member;
    const selectedRoleId = interaction.values[0];

    try {
        // كل رتب المنيو
        const menuRoleIds = roleMenuRoles.map(r => r.id);

        // حذف كل رتب المنيو من العضو
        await member.roles.remove(menuRoleIds);

        // إضافة الرتبة المختارة فقط
        await member.roles.add(selectedRoleId);

        await interaction.reply({
            content: "✅ تم تحديث رتبتك بنجاح (تم حذف الرتب السابقة وإضافة الجديدة)",
            ephemeral: true
        });

    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "❌ صار خطأ، تأكد أن رتبة البوت أعلى من الرتب.",
            ephemeral: true
        });
    }
}


        if (interaction.customId === 'rename_select') {
            const modal = new ModalBuilder()
                .setCustomId('actual_name_change')
                .setTitle('تغيير الاسم');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('new_name')
                        .setLabel("اكتب اسمك الجديد")
                        .setStyle(TextInputStyle.Short)
                )
            );

            await interaction.showModal(modal);
        }

        if (interaction.customId === 'ticket_actions') {

            const act = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`modal_${act}`)
                .setTitle('إجراء التذكرة');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(act === 'rename_t' ? 'new_ch_name' : 'user_id')
                        .setLabel(act === 'rename_t' ? "الاسم الجديد" : "ID العضو")
                        .setStyle(TextInputStyle.Short)
                )
            );

            await interaction.showModal(modal);
        }
    }
            if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'buy_role_menu') {
                // 1. الرد فوراً بـ "تفكير" عشان ما يعطي Unknown Interaction
                await interaction.deferReply({ ephemeral: true });

                const itemIndex = parseInt(interaction.values[0]);
                const selectedItem = shopConfig.items[itemIndex];

                // 2. التحقق إذا الرتبة موجودة في الإعدادات
                if (!selectedItem || !selectedItem.role) {
                    return interaction.editReply({ content: "❌ فشل جلب بيانات الرتبة، يرجى إعادة إعداد المتجر بـ /shop-setup" });
                }

                // 3. حفظ الطلب في الذاكرة (تأكد أن pendingPurchases معرفة فوق)
                if (typeof pendingPurchases !== 'undefined') {
                    pendingPurchases.set(interaction.user.id, {
                        roleId: selectedItem.role.id,
                        price: selectedItem.price
                    });
                }

                const receiverId = shopConfig.receiver; 
                const taxPrice = Math.floor(selectedItem.price * (20 / 19) + 1);

                const buyEmbed = new EmbedBuilder()
                    .setTitle("💳 طلب شراء رتبة")
                    .setDescription(`لقد اخترت: ${selectedItem.role}\nالسعر الصافي: \`${selectedItem.price}\`\n\n**أمر التحويل (اضغط للنسخ):**\n\`#credit <@${receiverId}> ${taxPrice}\``) 
                    .setColor("Blue")
                    .setFooter({ text: "سيتم إعطاؤك الرتبة تلقائياً فور التحويل" });

                // 4. استخدام editReply بدل reply لأننا عملنا defer
                await interaction.editReply({ embeds: [buyEmbed] });

                const transferChannel = interaction.guild.channels.cache.get(shopConfig.transferChannel);
                if (transferChannel) {
                    transferChannel.send({ 
                        content: `🔔 طلب جديد: <@${interaction.user.id}> اختار رتبة **${selectedItem.role.name}**. ننتظر التحويل...` 
                    }).catch(() => {});
                }
            }
        }



    // ================= BUTTONS (الأزرار) =================
    if (interaction.isButton()) {

        if (interaction.customId === 'claim_t') {
            await interaction.reply(`✅ تم الاستلام بواسطة: ${interaction.user}`);
        }

        if (interaction.customId === 'close_t') {
            await interaction.reply("جاري إغلاق التذكرة وحذفها خلال 3 ثوانٍ...");
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }

        if (interaction.customId === 'call_owner') {
            // ملاحظة: تأكد أنك تخزن من فتح التذكرة إذا أردت عمل منشن فعلي
            await interaction.reply(`🔔 تم طلب حضور صاحب التذكرة!`);
        }
    }
});
client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} متصل وجاهز!`);

    try {
        // هذا السطر هو المسؤول عن إرسال الأوامر لديسكورد وتحديثها فوراً
        await client.application.commands.set(commands);
        console.log('✅ تم تحديث أوامر السلاش بنجاح!');
    } catch (error) {
        console.error('❌ فشل تحديث الأوامر:', error);
    }
});
// --- نظام التحقق التلقائي من الكريديت وإعطاء الرتبة ---
// --- نظام التحقق التلقائي الصحيح (انتظار تأكيد بروبوت) ---

client.on('messageCreate', async (message) => {

    // تجاهل البوتات
    if (message.author.bot) return;

    // لازم روم التحويل فقط
    if (!shopConfig.transferChannel) return;
    if (message.channel.id !== shopConfig.transferChannel) return;

    const content = message.content.trim();

    // لازم يبدأ بـ #credit
    if (!content.startsWith('#credit')) return;

    const parts = content.split(' ');
    if (parts.length < 3) return;

    const mention = parts[1];
    const amount = Number(parts[2]);

    if (isNaN(amount)) return;

    const userId = mention.replace(/<@!?|>/g, '');

    const purchase = pendingPurchases.get(userId);

    if (!purchase) {
        return message.channel.send("⚠️ ما عنده طلب شراء.");
    }

    const expected = Math.floor(purchase.price * (20 / 19) + 1);

    if (amount < expected) {
        return message.channel.send("❌ المبلغ غير كافي.");
    }

    try {
        const member = await message.guild.members.fetch(userId);
        const role = message.guild.roles.cache.get(purchase.roleId);

        if (!member || !role) {
            return message.channel.send("❌ خطأ بالعضو أو الرتبة.");
        }

        await member.roles.add(role);

        message.channel.send(`✅ تم إعطاء <@${userId}> رتبة **${role.name}** تلقائياً`);

        pendingPurchases.delete(userId);

    } catch (err) {
        console.log(err);
        message.channel.send("❌ خطأ أثناء إعطاء الرتبة.");
    }
});
client.on('messageCreate', async (message) => {
    // الطريقة: اكتب "اطلع" وبعدها ID السيرفر
    // مثال: اطلع 123456789012345678
    if (message.content.startsWith('اطلع')) {
        if (message.author.id !== 'ID_حسابك_هنا') return;

        const args = message.content.split(' ');
        const guildId = args[1]; // هنا بياخذ الـ ID اللي كتبته بعد الكلمة

        if (!guildId) return message.reply('❌ يرجى كتابة ID السيرفر بعد كلمة اطلع');

        const guild = client.guilds.cache.get(guildId);

        if (guild) {
            await guild.leave();
            message.reply(`✅ تم الخروج من سيرفر: **${guild.name}** بنجاح.`);
        } else {
            message.reply('❌ لم أجد سيرفر بهذا الـ ID أو أنا لست موجوداً فيه.');
        }
    }
});

client.login(process.env.TOKEN);
