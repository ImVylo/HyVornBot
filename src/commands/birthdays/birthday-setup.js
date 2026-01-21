// Setup Birthday System Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'birthday-setup',
  aliases: ['birthdaysetup', 'setupbirthdays'],
  description: 'Configure the birthday system',
  category: 'birthdays',
  usage: 'birthday-setup <channelId> [customMessage] [birthdayRole]',
  permissions: ['Administrator'],
  guildOnly: true,

  async execute(client, message, args) {
    if (args.length < 1) {
      // Show current config
      const config = client.birthdays.getConfig(message.guild.id);

      if (!config) {
        return message.reply('❌ Birthday system is not configured. Use `birthday-setup <channelId>` to set up.');
      }

      const embed = new EmbedBuilder()
        .setColor('#ff69b4')
        .setTitle('🎂 Birthday Configuration')
        .addFields(
          { name: 'Channel', value: `<#${config.channel_id}>`, inline: true },
          { name: 'Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Message', value: config.message, inline: false }
        );

      if (config.role_id) {
        embed.addFields({ name: 'Birthday Role', value: `<@&${config.role_id}>`, inline: true });
      }

      return message.reply({ embeds: [embed] });
    }

    const channelId = args[0];
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel || channel.type !== 0) {
      return message.reply('❌ Invalid channel ID. Please provide a valid text channel.');
    }

    // Parse custom message and role
    let customMessage = 'Happy Birthday {user}! 🎉🎂';
    let roleId = null;

    // Check if second arg is a role mention or ID
    if (args[1]) {
      const potentialRole = message.guild.roles.cache.get(args[1]) || message.guild.roles.cache.get(args[1].replace(/[<@&>]/g, ''));
      if (potentialRole) {
        roleId = potentialRole.id;
        customMessage = args.slice(2).join(' ') || customMessage;
      } else {
        customMessage = args.slice(1).join(' ');
      }
    }

    client.birthdays.setConfig(message.guild.id, {
      channelId,
      message: customMessage,
      roleId,
      enabled: true,
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Birthday System Configured')
      .setDescription('Birthdays will be announced automatically!')
      .addFields(
        { name: 'Channel', value: `${channel}`, inline: true },
        { name: 'Message', value: customMessage + '\n`{user}` = mention\n`{username}` = username', inline: false }
      )
      .setFooter({ text: 'Users can set their birthday with !birthday <month> <day>' })
      .setTimestamp();

    if (roleId) {
      embed.addFields({ name: 'Birthday Role', value: `<@&${roleId}>`, inline: true });
    }

    await message.reply({ embeds: [embed] });
  },
};
