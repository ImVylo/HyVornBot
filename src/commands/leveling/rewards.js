// Level rewards list command
// Created by ImVylo

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors, Emojis } from '../../utils/constants.js';

export default {
  name: 'rewards',
  description: 'View level rewards in this server',
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('rewards')
    .setDescription('View level rewards in this server'),

  async execute(interaction, client) {
    try {
      // Get level roles from database
      const rewards = client.db.getLevelRoles(interaction.guild.id);

      if (rewards.length === 0) {
        return interaction.reply({
          content: '📭 There are no level rewards set up in this server!',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor(Colors.LEVELING)
        .setTitle(`${Emojis.TROPHY} Level Rewards`)
        .setDescription(`${rewards.length} reward(s) configured`)
        .setTimestamp();

      for (const reward of rewards) {
        const role = interaction.guild.roles.cache.get(reward.role_id);
        embed.addFields({
          name: `${Emojis.STAR} Level ${reward.level}`,
          value: role ? `Role: ${role}` : 'Role: *Deleted*',
          inline: true
        });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      client.logger.error('Rewards', 'Failed to list rewards:', error);
      await interaction.reply({
        content: '❌ Failed to list rewards. Please try again.',
        ephemeral: true
      });
    }
  }
};
