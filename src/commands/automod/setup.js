// AutoMod setup command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { PermissionLevels, Colors, AutoModDefaults } from '../../utils/constants.js';

export default {
  name: 'automod-setup',
  description: 'Configure AutoMod settings',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('automod-setup')
    .setDescription('Configure AutoMod settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(option =>
      option
        .setName('anti_spam')
        .setDescription('Enable anti-spam protection')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('anti_invites')
        .setDescription('Block Discord invite links')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('anti_links')
        .setDescription('Block external links')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('anti_caps')
        .setDescription('Prevent excessive caps')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('anti_mention_spam')
        .setDescription('Prevent mention spam')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('spam_max_messages')
        .setDescription('Max messages in spam interval (default: 5)')
        .setMinValue(2)
        .setMaxValue(20)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('spam_interval')
        .setDescription('Spam check interval in seconds (default: 5)')
        .setMinValue(1)
        .setMaxValue(60)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('max_mentions')
        .setDescription('Max mentions per message (default: 5)')
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('max_caps_percent')
        .setDescription('Max caps percentage (default: 70)')
        .setMinValue(10)
        .setMaxValue(100)
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const antiSpam = interaction.options.getBoolean('anti_spam');
    const antiInvites = interaction.options.getBoolean('anti_invites');
    const antiLinks = interaction.options.getBoolean('anti_links');
    const antiCaps = interaction.options.getBoolean('anti_caps');
    const antiMentionSpam = interaction.options.getBoolean('anti_mention_spam');
    const spamMaxMessages = interaction.options.getInteger('spam_max_messages');
    const spamInterval = interaction.options.getInteger('spam_interval');
    const maxMentions = interaction.options.getInteger('max_mentions');
    const maxCapsPercent = interaction.options.getInteger('max_caps_percent');

    try {
      const guild = client.db.getGuild(interaction.guild.id);
      const settings = guild.settings || {};
      const automodSettings = settings.automod || {};

      // Update settings
      if (antiSpam !== null) automodSettings.antiSpam = antiSpam;
      if (antiInvites !== null) automodSettings.antiInvites = antiInvites;
      if (antiLinks !== null) automodSettings.antiLinks = antiLinks;
      if (antiCaps !== null) automodSettings.antiCaps = antiCaps;
      if (antiMentionSpam !== null) automodSettings.antiMentionSpam = antiMentionSpam;
      if (spamMaxMessages !== null) automodSettings.spamMaxMessages = spamMaxMessages;
      if (spamInterval !== null) automodSettings.spamInterval = spamInterval * 1000;
      if (maxMentions !== null) automodSettings.maxMentions = maxMentions;
      if (maxCapsPercent !== null) automodSettings.maxCapsPercent = maxCapsPercent;

      settings.automod = automodSettings;
      client.db.updateGuildSettings(interaction.guild.id, settings);

      // Create embed showing current settings
      const embed = new EmbedBuilder()
        .setColor(Colors.SUCCESS)
        .setTitle('✅ AutoMod Settings Updated')
        .setDescription('Current AutoMod configuration:')
        .addFields(
          {
            name: '🛡️ Protection Modules',
            value: [
              `Anti-Spam: ${automodSettings.antiSpam ? '✅' : '❌'}`,
              `Anti-Invites: ${automodSettings.antiInvites ? '✅' : '❌'}`,
              `Anti-Links: ${automodSettings.antiLinks ? '✅' : '❌'}`,
              `Anti-Caps: ${automodSettings.antiCaps ? '✅' : '❌'}`,
              `Anti-Mention-Spam: ${automodSettings.antiMentionSpam ? '✅' : '❌'}`
            ].join('\n'),
            inline: true
          },
          {
            name: '⚙️ Thresholds',
            value: [
              `Spam Messages: ${automodSettings.spamMaxMessages || AutoModDefaults.MAX_MESSAGES_PER_INTERVAL}`,
              `Spam Interval: ${(automodSettings.spamInterval || AutoModDefaults.MESSAGE_INTERVAL) / 1000}s`,
              `Max Mentions: ${automodSettings.maxMentions || AutoModDefaults.MAX_MENTIONS}`,
              `Max Caps: ${automodSettings.maxCapsPercent || AutoModDefaults.MAX_CAPS_PERCENT}%`
            ].join('\n'),
            inline: true
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      client.logger.error('AutoModSetup', 'Failed to update settings:', error);
      await interaction.reply({
        content: '❌ Failed to update AutoMod settings. Please try again.',
        ephemeral: true
      });
    }
  }
};
