// Welcome test command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { PermissionLevels } from '../../utils/constants.js';

export default {
  name: 'welcome-test',
  description: 'Test the welcome or goodbye message',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('welcome-test')
    .setDescription('Test the welcome or goodbye message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Which message to test')
        .setRequired(true)
        .addChoices(
          { name: 'Welcome', value: 'welcome' },
          { name: 'Goodbye', value: 'goodbye' }
        )
    ),

  async execute(interaction, client) {
    const type = interaction.options.getString('type');

    try {
      const welcomeModule = client.getModule('welcome');
      if (!welcomeModule) {
        return interaction.reply({
          content: '❌ Welcome module is not loaded!',
          ephemeral: true
        });
      }

      if (type === 'welcome') {
        await welcomeModule.sendWelcome(interaction.member, true);
        await interaction.reply({
          content: '✅ Test welcome message sent!',
          ephemeral: true
        });
      } else {
        await welcomeModule.sendGoodbye(interaction.member, true);
        await interaction.reply({
          content: '✅ Test goodbye message sent!',
          ephemeral: true
        });
      }
    } catch (error) {
      client.logger.error('WelcomeTest', 'Failed to send test message:', error);
      await interaction.reply({
        content: '❌ Failed to send test message. Make sure welcome settings are configured!',
        ephemeral: true
      });
    }
  }
};
