// Ticket System Module
// Handles support ticket creation and management

import { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default class Tickets {
  constructor(client) {
    this.client = client;
    this.db = client.db;
    this.initDatabase();
  }

  initDatabase() {
    // Ticket configuration per guild
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS ticket_config (
        guild_id TEXT PRIMARY KEY,
        category_id TEXT,
        support_role_id TEXT,
        log_channel_id TEXT,
        enabled INTEGER DEFAULT 1
      )
    `).run();

    // Active tickets
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS tickets (
        ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        topic TEXT,
        created_at INTEGER NOT NULL,
        closed_at INTEGER,
        closed_by TEXT,
        status TEXT DEFAULT 'open'
      )
    `).run();
  }

  getConfig(guildId) {
    return this.db.prepare('SELECT * FROM ticket_config WHERE guild_id = ?').get(guildId);
  }

  setConfig(guildId, data) {
    const stmt = this.db.prepare(`
      INSERT INTO ticket_config (guild_id, category_id, support_role_id, log_channel_id, enabled)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        category_id = excluded.category_id,
        support_role_id = excluded.support_role_id,
        log_channel_id = excluded.log_channel_id,
        enabled = excluded.enabled
    `);
    stmt.run(guildId, data.categoryId, data.supportRoleId, data.logChannelId, data.enabled ? 1 : 0);
  }

  async createTicket(guild, user, topic = 'No topic provided') {
    const config = this.getConfig(guild.id);

    if (!config || !config.enabled) {
      throw new Error('Ticket system is not enabled in this server.');
    }

    // Check if user already has an open ticket
    const existingTicket = this.db.prepare(
      'SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = ?'
    ).get(guild.id, user.id, 'open');

    if (existingTicket) {
      throw new Error('You already have an open ticket.');
    }

    // Get next ticket number
    const lastTicket = this.db.prepare(
      'SELECT MAX(ticket_id) as max FROM tickets WHERE guild_id = ?'
    ).get(guild.id);
    const ticketNumber = (lastTicket?.max || 0) + 1;

    // Create channel
    const channelName = `ticket-${ticketNumber}-${user.username}`;
    const category = config.category_id ? guild.channels.cache.get(config.category_id) : null;

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category,
      topic: `Ticket #${ticketNumber} | User: ${user.tag} | ${topic}`,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
          ],
        },
        {
          id: this.client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
          ],
        },
      ],
    });

    // Add support role if configured
    if (config.support_role_id) {
      await channel.permissionOverwrites.create(config.support_role_id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
    }

    // Save to database
    this.db.prepare(`
      INSERT INTO tickets (guild_id, channel_id, user_id, topic, created_at, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(guild.id, channel.id, user.id, topic, Date.now(), 'open');

    // Send welcome message
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`🎫 Ticket #${ticketNumber}`)
      .setDescription(`Welcome ${user}, support will be with you shortly.\n\n**Topic:** ${topic}`)
      .setFooter({ text: 'Use the button below to close this ticket' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_close_${channel.id}`)
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

    await channel.send({ content: `${user} ${config.support_role_id ? `<@&${config.support_role_id}>` : ''}`, embeds: [embed], components: [row] });

    return { channel, ticketNumber };
  }

  async closeTicket(channel, closedBy, reason = 'No reason provided') {
    const ticket = this.db.prepare('SELECT * FROM tickets WHERE channel_id = ? AND status = ?')
      .get(channel.id, 'open');

    if (!ticket) {
      throw new Error('This is not an active ticket channel.');
    }

    // Update database
    this.db.prepare(`
      UPDATE tickets
      SET status = ?, closed_at = ?, closed_by = ?
      WHERE channel_id = ?
    `).run('closed', Date.now(), closedBy.id, channel.id);

    // Log closure
    const config = this.getConfig(ticket.guild_id);
    if (config?.log_channel_id) {
      const logChannel = channel.guild.channels.cache.get(config.log_channel_id);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🔒 Ticket Closed')
          .addFields(
            { name: 'Ticket Channel', value: channel.name, inline: true },
            { name: 'Closed By', value: `${closedBy.tag}`, inline: true },
            { name: 'Reason', value: reason },
            { name: 'Created', value: `<t:${Math.floor(ticket.created_at / 1000)}:R>`, inline: true },
            { name: 'Duration', value: this.formatDuration(Date.now() - ticket.created_at), inline: true }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }
    }

    // Send closing message
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🔒 Ticket Closing')
      .setDescription(`This ticket has been closed by ${closedBy}.\n**Reason:** ${reason}\n\nChannel will be deleted in 10 seconds.`)
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Delete channel after delay
    setTimeout(() => {
      channel.delete().catch(console.error);
    }, 10000);

    return ticket;
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  getTicketStats(guildId) {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ?').get(guildId);
    const open = this.db.prepare('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND status = ?').get(guildId, 'open');
    const closed = this.db.prepare('SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND status = ?').get(guildId, 'closed');

    return {
      total: total?.count || 0,
      open: open?.count || 0,
      closed: closed?.count || 0,
    };
  }
}
