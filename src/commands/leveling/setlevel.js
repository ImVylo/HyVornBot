// Set level command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { PermissionLevels, Colors, Emojis } from '../../utils/constants.js';

export default {
  name: 'setlevel',
  description: 'Set a user\'s level (Admin only)',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a user\'s level')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to set the level for')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('level')
        .setDescription('The level to set')
        .setMinValue(0)
        .setMaxValue(1000)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const level = interaction.options.getInteger('level');

    try {
      const levelingModule = client.getModule('leveling');
      if (!levelingModule) {
        return interaction.reply({
          content: '❌ Leveling module is not enabled!',
          ephemeral: true
        });
      }

      // Calculate XP for the target level
      const xp = levelingModule.calculateXPForLevel(level);
      
      // Set the user's XP
      client.db.setXP(user.id, interaction.guild.id, xp);

      const embed = new EmbedBuilder()
        .setColor(Colors.SUCCESS)
        .setTitle(`${Emojis.SUCCESS} Level Set`)
        .setDescription(`Set ${user}'s level to **${level}**`)
        .addFields(
          { name: 'User', value: user.toString(), inline: true },
          { name: 'New Level', value: level.toString(), inline: true },
          { name: 'XP Required', value: xp.toLocaleString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      client.logger.error('SetLevel', 'Failed to set level:', error);
      await interaction.reply({
        content: '❌ Failed to set level. Please try again.',
        ephemeral: true
      });
    }
  }
};
