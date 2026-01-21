// Setup Ticket System Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'ticket-setup',
  aliases: ['ticketsetup', 'setuptickets'],
  description: 'Configure the ticket system',
  category: 'tickets',
  usage: 'ticket-setup <category> [supportRole] [logChannel]',
  permissions: ['Administrator'],
  guildOnly: true,

  async execute(client, message, args) {
    if (args.length < 1) {
      return message.reply('❌ Please provide a category ID for tickets.');
    }

    const categoryId = args[0];
    const category = message.guild.channels.cache.get(categoryId);

    if (!category || category.type !== 4) {
      return message.reply('❌ Invalid category ID. Please provide a valid category channel.');
    }

    const supportRoleId = args[1] || null;
    const logChannelId = args[2] || null;

    // Validate support role
    if (supportRoleId) {
      const role = message.guild.roles.cache.get(supportRoleId);
      if (!role) {
        return message.reply('❌ Invalid support role ID.');
      }
    }

    // Validate log channel
    if (logChannelId) {
      const channel = message.guild.channels.cache.get(logChannelId);
      if (!channel || channel.type !== 0) {
        return message.reply('❌ Invalid log channel ID.');
      }
    }

    client.tickets.setConfig(message.guild.id, {
      categoryId,
      supportRoleId,
      logChannelId,
      enabled: true,
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Ticket System Configured')
      .addFields(
        { name: 'Category', value: `${category.name} (${categoryId})`, inline: false },
        { name: 'Support Role', value: supportRoleId ? `<@&${supportRoleId}>` : 'Not set', inline: true },
        { name: 'Log Channel', value: logChannelId ? `<#${logChannelId}>` : 'Not set', inline: true }
      )
      .setFooter({ text: 'Users can now create tickets!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
