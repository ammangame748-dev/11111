const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
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

// ===== بيانات المتجر =====
let shopConfig = {
    shopChannel: null,
    transferChannel: null,
    receiver: null,
    items: []
};

let pendingPurchases = new Map();

// ===== أوامر =====
const commands = [
    {
        name: 'shop-setup',
        description: 'إعداد المتجر',
        options: [
            { name: 'shop_channel', type: 7, required: true },
            { name: 'transfer_channel', type: 7, required: true },
            { name: 'receiver', type: 6, required: true },

            { name: 'role1', type: 8, required: true },
            { name: 'price1', type: 4, required: true },

            { name: 'role2', type: 8, required: true },
            { name: 'price2', type: 4, required: true },

            { name: 'role3', type: 8, required: true },
            { name: 'price3', type: 4, required: true },

            { name: 'role4', type: 8, required: true },
            { name: 'price4', type: 4, required: true },

            { name: 'role5', type: 8, required: true },
            { name: 'price5', type: 4, required: true }
        ]
    },
    {
        name: 'shop',
        description: 'نشر المتجر',
        options: [
            { name: 'description', type: 3, required: true }
        ]
    }
];

// ===== سلاش =====
client.on('interactionCreate', async (interaction) => {

    if (interaction.isChatInputCommand()) {

        // ===== إعداد =====
        if (interaction.commandName === 'shop-setup') {

            shopConfig.shopChannel = interaction.options.getChannel('shop_channel').id;
            shopConfig.transferChannel = interaction.options.getChannel('transfer_channel').id;
            shopConfig.receiver = interaction.options.getUser('receiver').id;

            shopConfig.items = [];

            for (let i = 1; i <= 5; i++) {
                shopConfig.items.push({
                    role: interaction.options.getRole(`role${i}`),
                    price: interaction.options.getInteger(`price${i}`)
                });
            }

            return interaction.reply({ content: "✅ تم إعداد المتجر", ephemeral: true });
        }

        // ===== نشر =====
        if (interaction.commandName === 'shop') {

            if (!shopConfig.shopChannel) {
                return interaction.reply({ content: "❌ سو setup أول", ephemeral: true });
            }

            const desc = interaction.options.getString('description');

            const embed = new EmbedBuilder()
                .setTitle("🛒 متجر الرتب")
                .setDescription(desc)
                .setColor("Gold");

            const menu = new StringSelectMenuBuilder()
                .setCustomId('buy')
                .setPlaceholder('اختر رتبة')
                .addOptions(
                    shopConfig.items.map((item, i) => ({
                        label: item.role.name,
                        description: `السعر: ${item.price}`,
                        value: `${i}`
                    }))
                );

            const row = new ActionRowBuilder().addComponents(menu);

            const ch = interaction.guild.channels.cache.get(shopConfig.shopChannel);

            await ch.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: "✅ تم نشر المتجر", ephemeral: true });
        }
    }

    // ===== شراء =====
    if (interaction.isStringSelectMenu() && interaction.customId === 'buy') {

        await interaction.deferReply({ ephemeral: true });

        const item = shopConfig.items[interaction.values[0]];

        pendingPurchases.set(interaction.user.id, {
            roleId: item.role.id,
            price: item.price
        });

        const tax = Math.floor(item.price * (20 / 19) + 1);

        const embed = new EmbedBuilder()
            .setTitle("💳 تحويل")
            .setDescription(`حول:\n\`#credit <@${shopConfig.receiver}> ${tax}\``)
            .setColor("Blue");

        await interaction.editReply({ embeds: [embed] });
    }
});

// ===== قراءة تحويل بروبوت =====
client.on('messageCreate', async (message) => {

    if (!shopConfig.transferChannel) return;
    if (message.channel.id !== shopConfig.transferChannel) return;
    if (message.author.id !== "282859044593598464") return;

    if (message.content.includes("has transferred")) {

        const amount = message.content.match(/\$(\d+)/);
        const user = message.content.match(/<@!?(\d+)>/);

        if (!amount || !user) return;

        const money = parseInt(amount[1]);
        const userId = user[1];

        const purchase = pendingPurchases.get(userId);

        if (purchase && money >= purchase.price) {

            const member = await message.guild.members.fetch(userId);
            const role = message.guild.roles.cache.get(purchase.roleId);

            await member.roles.add(role);

            message.channel.send(`✅ <@${userId}> تم إعطاؤك الرتبة`);

            pendingPurchases.delete(userId);
        }
    }
});

// ===== تشغيل =====
client.on('ready', async () => {
    console.log(`✅ ${client.user.tag}`);
    await client.application.commands.set(commands);
});

client.login(process.env.TOKEN);
