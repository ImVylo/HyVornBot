// Setup Suggestion System Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'suggest-setup',
  aliases: ['suggestsetup', 'setupsuggestions'],
  description: 'Configure the suggestion system',
  category: 'suggestions',
  usage: 'suggest-setup <channelId> [autoThread: true/false]',
  permissions: ['Administrator'],
  guildOnly: true,

  async execute(client, message, args) {
    if (args.length < 1) {
      // Show current config
      const config = client.suggestions.getConfig(message.guild.id);

      if (!config) {
        return message.reply('❌ Suggestion system is not configured. Use `suggest-setup <channelId>` to set up.');
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('💡 Suggestion Configuration')
        .addFields(
          { name: 'Channel', value: `<#${config.channel_id}>`, inline: true },
          { name: 'Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Auto Thread', value: config.auto_thread ? '✅ Yes' : '❌ No', inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    const channelId = args[0];
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel || channel.type !== 0) {
      return message.reply('❌ Invalid channel ID. Please provide a valid text channel.');
    }

    const autoThread = args[1] ? args[1].toLowerCase() === 'true' : false;

    client.suggestions.setConfig(message.guild.id, {
      channelId,
      autoThread,
      enabled: true,
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Suggestion System Configured')
      .setDescription('Users can now submit suggestions!')
      .addFields(
        { name: 'Channel', value: `${channel}`, inline: true },
        { name: 'Auto Thread', value: autoThread ? '✅ Enabled' : '❌ Disabled', inline: true }
      )
      .setFooter({ text: 'Use !suggest <suggestion> to submit a suggestion' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
