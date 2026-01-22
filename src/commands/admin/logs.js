// Logs command - Configure logging channels
// Created by ImVylo

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { Colors, PermissionLevels, Emojis, LogChannels } from '../../utils/constants.js';
import { successEmbed, errorEmbed } from '../../utils/embeds.js';

export default {
  name: 'logs',
  description: 'Configure logging channels',
  aliases: [],
  cooldown: 5,
  guildOnly: true,
  permissionLevel: PermissionLevels.ADMIN,

  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Configure logging channels')
    .addSubcommand(sub =>
      sub.setName('channels')
        .setDescription('Configure log channels')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('The type of log')
            .setRequired(true)
            .addChoices(
              { name: 'Join/Leave Logs', value: 'joins' },
              { name: 'Message Logs (edits, deletes)', value: 'messages' },
              { name: 'User Logs (roles, nicknames)', value: 'users' },
              { name: 'Moderation Logs (kicks, bans)', value: 'moderation' },
              { name: 'AutoMod Logs', value: 'automod' },
              { name: 'Invite Logs', value: 'invites' },
              { name: 'Voice Logs', value: 'voice' },
              { name: 'Set All Logs', value: 'all' },
              { name: 'View All', value: 'view' }
            )
        )
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('The channel (leave empty to disable)')
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    const guildId = interaction.guild.id;
    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('channel');

    // View log configuration
    if (type === 'view') {
      return showLogConfig(interaction, client);
    }

    // Set all log channels to the same channel
    if (type === 'all') {
      const channelTypes = ['joins', 'messages', 'users', 'moderation', 'automod', 'invites', 'voice'];

      for (const logType of channelTypes) {
        const settingKey = LogChannels[logType];
        client.db.setSetting(guildId, settingKey, channel?.id || null);
      }

      if (channel) {
        return interaction.reply({
          embeds: [successEmbed(`All log channels set to ${channel}.`)]
        });
      } else {
        return interaction.reply({
          embeds: [successEmbed('All log channels have been disabled.')]
        });
      }
    }

    // Handle individual log channel settings
    const settingKey = LogChannels[type];
    const logNames = {
      joins: 'Join/Leave',
      messages: 'Message',
      users: 'User',
      moderation: 'Moderation',
      automod: 'AutoMod',
      invites: 'Invite',
      voice: 'Voice'
    };

    client.db.setSetting(guildId, settingKey, channel?.id || null);

    if (channel) {
      return interaction.reply({
        embeds: [successEmbed(`${logNames[type]} logs will be sent to ${channel}.`)]
      });
    } else {
      return interaction.reply({
        embeds: [successEmbed(`${logNames[type]} logs have been disabled.`)]
      });
    }
  }
};

async function showLogConfig(interaction, client) {
  const guild = interaction.guild;
  const settings = client.db.getGuild(guild.id).settings;

  const getChannel = (key) => {
    const id = settings[key];
    return id ? `<#${id}>` : '`Not set`';
  };

  const embed = new EmbedBuilder()
    .setColor(Colors.PRIMARY)
    .setTitle(`${Emojis.INFO} Log Channels Configuration`)
    .setDescription('Use `/logs channels <type> [channel]` to configure.')
    .addFields(
      { name: '👋 Join/Leave Logs', value: getChannel(LogChannels.joins), inline: true },
      { name: '💬 Message Logs', value: getChannel(LogChannels.messages), inline: true },
      { name: '👤 User Logs', value: getChannel(LogChannels.users), inline: true },
      { name: '🔨 Moderation Logs', value: getChannel(LogChannels.moderation), inline: true },
      { name: '🤖 AutoMod Logs', value: getChannel(LogChannels.automod), inline: true },
      { name: '📨 Invite Logs', value: getChannel(LogChannels.invites), inline: true },
      { name: '🔊 Voice Logs', value: getChannel(LogChannels.voice), inline: true }
    )
    .setFooter({ text: 'Tip: Use type "Set All Logs" to configure all at once' })
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}
