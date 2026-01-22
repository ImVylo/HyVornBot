// AutoMod toggle command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { PermissionLevels } from '../../utils/constants.js';

export default {
  name: 'automod-toggle',
  description: 'Enable or disable AutoMod',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('automod-toggle')
    .setDescription('Enable or disable AutoMod')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(option =>
      option
        .setName('enabled')
        .setDescription('Enable or disable AutoMod')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const enabled = interaction.options.getBoolean('enabled');

    try {
      const guild = client.db.getGuild(interaction.guild.id);
      const settings = guild.settings || {};
      const enabledModules = settings.enabledModules || {};

      enabledModules.automod = enabled;
      settings.enabledModules = enabledModules;
      
      client.db.updateGuildSettings(interaction.guild.id, settings);

      await interaction.reply({
        content: `✅ AutoMod has been ${enabled ? '**enabled**' : '**disabled**'}`,
        ephemeral: false
      });
    } catch (error) {
      client.logger.error('AutoModToggle', 'Failed to toggle AutoMod:', error);
      await interaction.reply({
        content: '❌ Failed to toggle AutoMod. Please try again.',
        ephemeral: true
      });
    }
  }
};
