// AutoMod whitelist command
// Created by ImVylo

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { PermissionLevels, Colors } from '../../utils/constants.js';

export default {
  name: 'automod-whitelist',
  description: 'Manage AutoMod whitelist',
  permissionLevel: PermissionLevels.ADMIN,
  guildOnly: true,

  data: new SlashCommandBuilder()
    .setName('automod-whitelist')
    .setDescription('Manage AutoMod whitelist')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add-user')
        .setDescription('Add a user to the whitelist')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('The user to whitelist')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove-user')
        .setDescription('Remove a user from the whitelist')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('The user to remove')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add-role')
        .setDescription('Add a role to the whitelist')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The role to whitelist')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove-role')
        .setDescription('Remove a role from the whitelist')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The role to remove')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add-channel')
        .setDescription('Add a channel to the whitelist')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to whitelist')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove-channel')
        .setDescription('Remove a channel from the whitelist')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to remove')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Show the current whitelist')
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    try {
      const guild = client.db.getGuild(interaction.guild.id);
      const settings = guild.settings || {};
      const automodSettings = settings.automod || {};
      const whitelist = automodSettings.whitelist || { users: [], roles: [], channels: [] };

      switch (subcommand) {
        case 'add-user': {
          const user = interaction.options.getUser('user');
          if (!whitelist.users.includes(user.id)) {
            whitelist.users.push(user.id);
            automodSettings.whitelist = whitelist;
            settings.automod = automodSettings;
            client.db.updateGuildSettings(interaction.guild.id, settings);
            await interaction.reply(`✅ Added ${user} to AutoMod whitelist`);
          } else {
            await interaction.reply({ content: '❌ That user is already whitelisted!', ephemeral: true });
          }
          break;
        }

        case 'remove-user': {
          const user = interaction.options.getUser('user');
          const index = whitelist.users.indexOf(user.id);
          if (index > -1) {
            whitelist.users.splice(index, 1);
            automodSettings.whitelist = whitelist;
            settings.automod = automodSettings;
            client.db.updateGuildSettings(interaction.guild.id, settings);
            await interaction.reply(`✅ Removed ${user} from AutoMod whitelist`);
          } else {
            await interaction.reply({ content: '❌ That user is not whitelisted!', ephemeral: true });
          }
          break;
        }

        case 'add-role': {
          const role = interaction.options.getRole('role');
          if (!whitelist.roles.includes(role.id)) {
            whitelist.roles.push(role.id);
            automodSettings.whitelist = whitelist;
            settings.automod = automodSettings;
            client.db.updateGuildSettings(interaction.guild.id, settings);
            await interaction.reply(`✅ Added ${role} to AutoMod whitelist`);
          } else {
            await interaction.reply({ content: '❌ That role is already whitelisted!', ephemeral: true });
          }
          break;
        }

        case 'remove-role': {
          const role = interaction.options.getRole('role');
          const index = whitelist.roles.indexOf(role.id);
          if (index > -1) {
            whitelist.roles.splice(index, 1);
            automodSettings.whitelist = whitelist;
            settings.automod = automodSettings;
            client.db.updateGuildSettings(interaction.guild.id, settings);
            await interaction.reply(`✅ Removed ${role} from AutoMod whitelist`);
          } else {
            await interaction.reply({ content: '❌ That role is not whitelisted!', ephemeral: true });
          }
          break;
        }

        case 'add-channel': {
          const channel = interaction.options.getChannel('channel');
          if (!whitelist.channels.includes(channel.id)) {
            whitelist.channels.push(channel.id);
            automodSettings.whitelist = whitelist;
            settings.automod = automodSettings;
            client.db.updateGuildSettings(interaction.guild.id, settings);
            await interaction.reply(`✅ Added ${channel} to AutoMod whitelist`);
          } else {
            await interaction.reply({ content: '❌ That channel is already whitelisted!', ephemeral: true });
          }
          break;
        }

        case 'remove-channel': {
          const channel = interaction.options.getChannel('channel');
          const index = whitelist.channels.indexOf(channel.id);
          if (index > -1) {
            whitelist.channels.splice(index, 1);
            automodSettings.whitelist = whitelist;
            settings.automod = automodSettings;
            client.db.updateGuildSettings(interaction.guild.id, settings);
            await interaction.reply(`✅ Removed ${channel} from AutoMod whitelist`);
          } else {
            await interaction.reply({ content: '❌ That channel is not whitelisted!', ephemeral: true });
          }
          break;
        }

        case 'list': {
          const embed = new EmbedBuilder()
            .setColor(Colors.INFO)
            .setTitle('🛡️ AutoMod Whitelist')
            .setTimestamp();

          const users = whitelist.users?.map(id => `<@${id}>`).join('\n') || 'None';
          const roles = whitelist.roles?.map(id => `<@&${id}>`).join('\n') || 'None';
          const channels = whitelist.channels?.map(id => `<#${id}>`).join('\n') || 'None';

          embed.addFields(
            { name: '👥 Whitelisted Users', value: users, inline: true },
            { name: '🎭 Whitelisted Roles', value: roles, inline: true },
            { name: '💬 Whitelisted Channels', value: channels, inline: true }
          );

          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    } catch (error) {
      client.logger.error('AutoModWhitelist', 'Failed to manage whitelist:', error);
      await interaction.reply({
        content: '❌ Failed to update whitelist. Please try again.',
        ephemeral: true
      });
    }
  }
};
