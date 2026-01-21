// Setup Temporary Voice Channels Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'tempvoice',
  aliases: ['temp-voice', 'setupvoice'],
  description: 'Configure temporary voice channels',
  category: 'voice',
  usage: 'tempvoice <lobbyChannelId> [category] [nameFormat] [userLimit]',
  permissions: ['Administrator'],
  guildOnly: true,

  async execute(client, message, args) {
    if (args.length < 1) {
      // Show current config
      const config = client.tempVoice.getConfig(message.guild.id);

      if (!config) {
        return message.reply('❌ Temporary voice channels are not configured. Use `tempvoice <lobbyChannelId>` to set up.');
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🎤 Temporary Voice Configuration')
        .addFields(
          { name: 'Lobby Channel', value: `<#${config.lobby_channel_id}>`, inline: true },
          { name: 'Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Channel Name Format', value: config.channel_name, inline: false },
          { name: 'User Limit', value: config.user_limit === 0 ? 'Unlimited' : config.user_limit.toString(), inline: true }
        );

      if (config.category_id) {
        embed.addFields({ name: 'Category', value: `<#${config.category_id}>`, inline: true });
      }

      return message.reply({ embeds: [embed] });
    }

    const lobbyChannelId = args[0];
    const lobbyChannel = message.guild.channels.cache.get(lobbyChannelId);

    if (!lobbyChannel || lobbyChannel.type !== 2) {
      return message.reply('❌ Invalid lobby channel ID. Please provide a valid voice channel.');
    }

    const categoryId = args[1] || null;
    if (categoryId) {
      const category = message.guild.channels.cache.get(categoryId);
      if (!category || category.type !== 4) {
        return message.reply('❌ Invalid category ID.');
      }
    }

    const channelName = args[2] || 'Voice {user}';
    const userLimit = parseInt(args[3]) || 0;

    client.tempVoice.setConfig(message.guild.id, {
      lobbyChannelId,
      categoryId,
      channelName,
      userLimit,
      enabled: true,
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Temporary Voice Configured')
      .setDescription('Users who join the lobby channel will get their own temporary voice channel!')
      .addFields(
        { name: 'Lobby Channel', value: `${lobbyChannel}`, inline: false },
        { name: 'Channel Name Format', value: channelName + '\n`{user}` = username', inline: true },
        { name: 'User Limit', value: userLimit === 0 ? 'Unlimited' : userLimit.toString(), inline: true }
      )
      .setFooter({ text: 'Channels are automatically deleted when empty' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
