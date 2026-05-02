const {
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder,
    StringSelectMenuBuilder, PermissionFlagsBits
} = require('discord.js');

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// IDs
const RECEIVER_ID = "934215537150554113";
const SHOP_CHANNEL = "1411239994202259568";
const TRANSFER_CHANNEL = "1411239995263553576";

// Data
let pendingPurchases = new Map();

let shopConfig = {
    items: []
};
client.on('interactionCreate', async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'shop-setup') {

        shopConfig.items = [];

        for (let i = 1; i <= 5; i++) {
            shopConfig.items.push({
                role: interaction.options.getRole(`role${i}`),
                price: interaction.options.getInteger(`price${i}`)
            });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('buy_menu')
            .setPlaceholder('اختر رتبة')
            .addOptions(
                shopConfig.items.map((item, i) => ({
                    label: item.role.name,
                    value: String(i),
                    description: `السعر: ${item.price}`
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const channel = interaction.guild.channels.cache.get(SHOP_CHANNEL);

        await channel.send({
            content: "🛒 متجر الرتب",
            components: [row]
        });

        await interaction.reply({ content: "تم إنشاء المتجر", ephemeral: true });
    }
});
client.on('interactionCreate', async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'buy_menu') {

        const index = parseInt(interaction.values[0]);
        const item = shopConfig.items[index];

        pendingPurchases.set(interaction.user.id, {
            roleId: item.role.id,
            price: item.price
        });

        const tax = Math.floor(item.price * (20 / 19) + 1);

        await interaction.reply({
            content: `تحويل إلى: <@${RECEIVER_ID}>\nالمبلغ: ${tax}`,
            ephemeral: true
        });
    }
});
client.on('messageCreate', async (message) => {

    if (message.author.bot) return;
    if (message.channel.id !== TRANSFER_CHANNEL) return;

    const content = message.content.trim();

    if (!content.startsWith('#credit')) return;

    const parts = content.split(' ');
    if (parts.length < 3) return;

    const userId = parts[1].replace(/<@!?|>/g, '');
    const amount = Number(parts[2]);

    const purchase = pendingPurchases.get(userId);
    if (!purchase) return;

    const expected = Math.floor(purchase.price * (20 / 19) + 1);

    if (amount < expected) return;

    try {
        const member = await message.guild.members.fetch(userId);
        const role = message.guild.roles.cache.get(purchase.roleId);

        await member.roles.add(role);

        message.channel.send(
            `✅ تم إعطاء <@${userId}> رتبة **${role.name}**`
        );

        pendingPurchases.delete(userId);

    } catch (err) {
        console.log(err);
    }
});

client.login(process.env.TOKEN);
