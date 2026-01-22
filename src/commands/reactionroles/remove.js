// Reaction role remove command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { PermissionLevels } from '../../utils/constants.js';

export default {
  name: 'reactionrole-remove',
  description: 'Remove a reaction role from a message',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('reactionrole-remove')
    .setDescription('Remove a reaction role from a message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(option =>
      option
        .setName('message_id')
        .setDescription('The message ID')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('emoji')
        .setDescription('The emoji to remove')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');
    const emoji = interaction.options.getString('emoji');

    try {
      const reactionRoleModule = client.getModule('reactionroles');
      const removed = await reactionRoleModule.removeReactionRole({
        guildId: interaction.guild.id,
        messageId: messageId,
        emoji: emoji
      });

      if (!removed) {
        return interaction.reply({
          content: '❌ Could not find that reaction role!',
          ephemeral: true
        });
      }

      await interaction.reply({
        content: `✅ Reaction role removed for ${emoji}`,
        ephemeral: true
      });
    } catch (error) {
      client.logger.error('ReactionRoleRemove', 'Failed to remove reaction role:', error);
      await interaction.reply({
        content: '❌ Failed to remove reaction role. Please try again.',
        ephemeral: true
      });
    }
  }
};
