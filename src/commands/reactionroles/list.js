// Reaction role list command
// Created by ImVylo

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Colors } from '../../utils/constants.js';

export default {
  name: 'reactionrole-list',
  description: 'List all reaction roles in this server',
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('reactionrole-list')
    .setDescription('List all reaction roles in this server'),

  async execute(interaction, client) {
    try {
      const reactionRoleModule = client.getModule('reactionroles');
      const reactionRoles = await reactionRoleModule.getReactionRoles(interaction.guild.id);

      if (!reactionRoles || reactionRoles.length === 0) {
        return interaction.reply({
          content: '📭 There are no reaction roles set up in this server!',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor(Colors.PRIMARY)
        .setTitle('⚡ Reaction Roles')
        .setDescription(`Found ${reactionRoles.length} reaction role(s)`)
        .setTimestamp();

      // Group by message
      const byMessage = {};
      for (const rr of reactionRoles) {
        if (!byMessage[rr.message_id]) {
          byMessage[rr.message_id] = [];
        }
        byMessage[rr.message_id].push(rr);
      }

      for (const [messageId, roles] of Object.entries(byMessage)) {
        const roleList = roles.map(r => {
          const role = interaction.guild.roles.cache.get(r.role_id);
          return `${r.emoji} → ${role || 'Unknown Role'}`;
        }).join('\n');

        const channel = interaction.guild.channels.cache.get(roles[0].channel_id);
        
        embed.addFields({
          name: `Message ${messageId}`,
          value: `**Channel:** ${channel || 'Unknown'}\n${roleList}`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      client.logger.error('ReactionRoleList', 'Failed to list reaction roles:', error);
      await interaction.reply({
        content: '❌ Failed to list reaction roles. Please try again.',
        ephemeral: true
      });
    }
  }
};
