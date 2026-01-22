// Reaction role create command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { PermissionLevels } from '../../utils/constants.js';

export default {
  name: 'reactionrole-create',
  description: 'Create a reaction role on a message',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('reactionrole-create')
    .setDescription('Create a reaction role on a message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(option =>
      option
        .setName('message_id')
        .setDescription('The message ID to add reactions to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('emoji')
        .setDescription('The emoji to use (e.g., 🎮 or custom emoji)')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to give when reacted')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel the message is in (defaults to current)')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');
    const emojiInput = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

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
      // Fetch the message
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (!message) {
        return interaction.reply({
          content: '❌ Could not find that message in the specified channel!',
          ephemeral: true
        });
      }

      // Add reaction to message
      await message.react(emojiInput).catch(() => {
        throw new Error('Invalid emoji or unable to react');
      });

      // Store in database
      const reactionRoleModule = client.getModule('reactionroles');
      await reactionRoleModule.addReactionRole({
        guildId: interaction.guild.id,
        channelId: channel.id,
        messageId: messageId,
        emoji: emojiInput,
        roleId: role.id
      });

      await interaction.reply({
        content: `✅ Reaction role created! Users who react with ${emojiInput} will receive ${role}`,
        ephemeral: true
      });
    } catch (error) {
      client.logger.error('ReactionRoleCreate', 'Failed to create reaction role:', error);
      await interaction.reply({
        content: `❌ Failed to create reaction role: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
