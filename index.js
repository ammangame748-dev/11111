const {
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder,
    ButtonStyle, PermissionFlagsBits, ModalBuilder, TextInputBuilder,
    TextInputStyle, StringSelectMenuBuilder, InteractionType
} = require('discord.js');

const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('البوت شغال 24/7 ✅'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ================== DATA ==================
let pendingPurchases = new Map();

let shopConfig = {
    shopChannel: null,
    transferChannel: null,
    receiver: null,
    items: []
};const commands = [
    {
        name: 'shop-setup',
        description: 'إعداد متجر الرتب',
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
            { name: 'price5', type: 4, required: true },

            { name: 'role6', type: 8, required: true },
            { name: 'price6', type: 4, required: true },

            { name: 'role7', type: 8, required: true },
            { name: 'price7', type: 4, required: true },

            { name: 'role8', type: 8, required: true },
            { name: 'price8', type: 4, required: true },

            { name: 'role9', type: 8, required: true },
            { name: 'price9', type: 4, required: true },

            { name: 'role10', type: 8, required: true },
            { name: 'price10', type: 4, required: true },

            { name: 'role11', type: 8, required: true },
            { name: 'price11', type: 4, required: true }
        ]
    }
];
client.on('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    await client.application.commands.set(commands);
});

// ================== SHOP SETUP ==================
client.on('interactionCreate', async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

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
});
client.on('interactionCreate', async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'buy_role_menu') {

        await interaction.deferReply({ ephemeral: true });

        const index = parseInt(interaction.values[0]);
        const item = shopConfig.items[index];

        if (!item) return interaction.editReply("❌ خطأ");

        pendingPurchases.set(interaction.user.id, {
            roleId: item.role.id,
            price: item.price
        });

        const tax = Math.floor(item.price * (20 / 19) + 1);

        const embed = new EmbedBuilder()
            .setTitle("💳 شراء رتبة")
            .setDescription(`الرتبة: ${item.role.name}\nالسعر: ${item.price}\n\n#credit <@${shopConfig.receiver}> ${tax}`)
            .setColor("Blue");

        await interaction.editReply({ embeds: [embed] });
    }
});
