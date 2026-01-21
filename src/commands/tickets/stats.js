// Ticket Statistics Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'ticket-stats',
  aliases: ['ticketstats', 'tickets'],
  description: 'View ticket statistics',
  category: 'tickets',
  usage: 'ticket-stats',
  permissions: ['ManageChannels'],
  guildOnly: true,

  async execute(client, message, args) {
    const stats = client.tickets.getTicketStats(message.guild.id);
    const config = client.tickets.getConfig(message.guild.id);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🎫 Ticket Statistics')
      .addFields(
        { name: 'Total Tickets', value: stats.total.toString(), inline: true },
        { name: 'Open Tickets', value: stats.open.toString(), inline: true },
        { name: 'Closed Tickets', value: stats.closed.toString(), inline: true },
        { name: 'Status', value: config?.enabled ? '✅ Enabled' : '❌ Disabled', inline: true }
      )
      .setFooter({ text: `Server: ${message.guild.name}` })
      .setTimestamp();

    if (config?.category_id) {
      const category = message.guild.channels.cache.get(config.category_id);
      embed.addFields({ name: 'Category', value: category ? category.name : 'Unknown', inline: true });
    }

    await message.reply({ embeds: [embed] });
  },
};
