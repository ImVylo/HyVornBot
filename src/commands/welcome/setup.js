// Welcome setup command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';
import { PermissionLevels, Colors } from '../../utils/constants.js';

export default {
  name: 'welcome-setup',
  description: 'Configure welcome and goodbye messages',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('welcome-setup')
    .setDescription('Configure welcome and goodbye messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to send welcome/goodbye messages')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('welcome_message')
        .setDescription('Welcome message (use {user} for mention, {username} for name, {server} for server name)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('goodbye_message')
        .setDescription('Goodbye message (use {user} for mention, {username} for name, {server} for server name)')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('welcome_enabled')
        .setDescription('Enable welcome messages')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('goodbye_enabled')
        .setDescription('Enable goodbye messages')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('use_embed')
        .setDescription('Send messages as embeds')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('welcome_title')
        .setDescription('Title for welcome embed')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('goodbye_title')
        .setDescription('Title for goodbye embed')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const welcomeMessage = interaction.options.getString('welcome_message');
    const goodbyeMessage = interaction.options.getString('goodbye_message');
    const welcomeEnabled = interaction.options.getBoolean('welcome_enabled');
    const goodbyeEnabled = interaction.options.getBoolean('goodbye_enabled');
    const useEmbed = interaction.options.getBoolean('use_embed');
    const welcomeTitle = interaction.options.getString('welcome_title');
    const goodbyeTitle = interaction.options.getString('goodbye_title');

    try {
      const guild = client.db.getGuild(interaction.guild.id);
      const settings = guild.settings || {};
      const welcomeSettings = settings.welcome || {};

      // Update settings
      if (channel) welcomeSettings.channelId = channel.id;
      if (welcomeMessage !== null) welcomeSettings.welcomeMessage = welcomeMessage;
      if (goodbyeMessage !== null) welcomeSettings.goodbyeMessage = goodbyeMessage;
      if (welcomeEnabled !== null) welcomeSettings.welcomeEnabled = welcomeEnabled;
      if (goodbyeEnabled !== null) welcomeSettings.goodbyeEnabled = goodbyeEnabled;
      if (useEmbed !== null) welcomeSettings.useEmbed = useEmbed;
      if (welcomeTitle !== null) welcomeSettings.welcomeTitle = welcomeTitle;
      if (goodbyeTitle !== null) welcomeSettings.goodbyeTitle = goodbyeTitle;

      settings.welcome = welcomeSettings;
      client.db.updateGuildSettings(interaction.guild.id, settings);

      const embed = new EmbedBuilder()
        .setColor(Colors.SUCCESS)
        .setTitle('✅ Welcome/Goodbye Settings Updated')
        .setDescription('Current configuration:')
        .addFields(
          {
            name: '📍 Channel',
            value: welcomeSettings.channelId ? `<#${welcomeSettings.channelId}>` : 'Not set',
            inline: true
          },
          {
            name: '⚙️ Status',
            value: [
              `Welcome: ${welcomeSettings.welcomeEnabled ? '✅' : '❌'}`,
              `Goodbye: ${welcomeSettings.goodbyeEnabled ? '✅' : '❌'}`,
              `Use Embeds: ${welcomeSettings.useEmbed ? '✅' : '❌'}`
            ].join('\n'),
            inline: true
          }
        )
        .setTimestamp();

      if (welcomeSettings.welcomeMessage) {
        embed.addFields({
          name: '👋 Welcome Message',
          value: `\`\`\`${welcomeSettings.welcomeMessage}\`\`\``,
          inline: false
        });
      }

      if (welcomeSettings.goodbyeMessage) {
        embed.addFields({
          name: '👋 Goodbye Message',
          value: `\`\`\`${welcomeSettings.goodbyeMessage}\`\`\``,
          inline: false
        });
      }

      embed.addFields({
        name: 'ℹ️ Available Placeholders',
        value: '`{user}` - User mention\n`{username}` - Username\n`{server}` - Server name\n`{membercount}` - Member count',
        inline: false
      });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      client.logger.error('WelcomeSetup', 'Failed to update settings:', error);
      await interaction.reply({
        content: '❌ Failed to update welcome settings. Please try again.',
        ephemeral: true
      });
    }
  }
};
