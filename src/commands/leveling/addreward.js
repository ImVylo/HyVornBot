// Add level reward command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { PermissionLevels } from '../../utils/constants.js';

export default {
  name: 'addreward',
  description: 'Add a role reward for reaching a level',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('addreward')
    .setDescription('Add a role reward for reaching a level')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(option =>
      option
        .setName('level')
        .setDescription('The level required')
        .setMinValue(1)
        .setMaxValue(1000)
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to give')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const level = interaction.options.getInteger('level');
    const role = interaction.options.getRole('role');

    // Verify bot can manage the role
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        content: '❌ I cannot manage that role! It is higher than or equal to my highest role.',
        ephemeral: true
      });
    }

    if (role.managed) {
      return interaction.reply({
        content: '❌ That role is managed by an integration and cannot be assigned!',
        ephemeral: true
      });
    }

    try {
      // Check if reward already exists for this level
      const existingRewards = client.db.getLevelRoles(interaction.guild.id);
      const existingReward = existingRewards.find(r => r.level === level);

      // Add or update the level role
      client.db.setLevelRole(interaction.guild.id, level, role.id);

      if (existingReward) {
        await interaction.reply({
          content: `✅ Updated level ${level} reward to ${role}`,
        });
      } else {
        await interaction.reply({
          content: `✅ Added ${role} as a reward for reaching level ${level}!`,
        });
      }
    } catch (error) {
      client.logger.error('AddReward', 'Failed to add reward:', error);
      await interaction.reply({
        content: '❌ Failed to add reward. Please try again.',
        ephemeral: true
      });
    }
  }
};
