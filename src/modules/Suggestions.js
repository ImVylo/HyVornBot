// Suggestions Module
// Allows users to submit suggestions that can be voted on and managed

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default class Suggestions {
  constructor(client) {
    this.client = client;
    this.db = client.db;
    this.initDatabase();
  }

  initDatabase() {
    // Suggestion configuration per guild
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS suggestion_config (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        review_channel_id TEXT,
        auto_thread INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1
      )
    `).run();

    // Suggestions
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS suggestions (
        suggestion_id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message_id TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        response TEXT,
        responded_by TEXT
      )
    `).run();
  }

  getConfig(guildId) {
    return this.db.prepare('SELECT * FROM suggestion_config WHERE guild_id = ?').get(guildId);
  }

  setConfig(guildId, data) {
    const stmt = this.db.prepare(`
      INSERT INTO suggestion_config (guild_id, channel_id, review_channel_id, auto_thread, enabled)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        channel_id = excluded.channel_id,
        review_channel_id = excluded.review_channel_id,
        auto_thread = excluded.auto_thread,
        enabled = excluded.enabled
    `);
    stmt.run(
      guildId,
      data.channelId,
      data.reviewChannelId || null,
      data.autoThread ? 1 : 0,
      data.enabled ? 1 : 0
    );
  }

  async createSuggestion(guild, user, content) {
    const config = this.getConfig(guild.id);

    if (!config || !config.enabled) {
      throw new Error('Suggestions are not enabled in this server.');
    }

    const channel = guild.channels.cache.get(config.channel_id);
    if (!channel) {
      throw new Error('Suggestion channel not found.');
    }

    // Get next suggestion number
    const lastSuggestion = this.db.prepare(
      'SELECT MAX(suggestion_id) as max FROM suggestions WHERE guild_id = ?'
    ).get(guild.id);
    const suggestionNumber = (lastSuggestion?.max || 0) + 1;

    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setTitle(`💡 Suggestion #${suggestionNumber}`)
      .setDescription(content)
      .addFields({ name: 'Status', value: '⏳ Pending', inline: true })
      .setFooter({ text: `ID: ${suggestionNumber}` })
      .setTimestamp();

    // Send message
    const message = await channel.send({ embeds: [embed] });

    // Add reactions
    await message.react('👍');
    await message.react('👎');

    // Create thread if enabled
    if (config.auto_thread) {
      await message.startThread({
        name: `Suggestion #${suggestionNumber} Discussion`,
        autoArchiveDuration: 1440,
      });
    }

    // Save to database
    this.db.prepare(`
      INSERT INTO suggestions (guild_id, user_id, message_id, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(guild.id, user.id, message.id, content, Date.now());

    return { suggestionNumber, message };
  }

  async updateSuggestionStatus(guildId, suggestionId, status, response, respondedBy) {
    const suggestion = this.db.prepare(
      'SELECT * FROM suggestions WHERE guild_id = ? AND suggestion_id = ?'
    ).get(guildId, suggestionId);

    if (!suggestion) {
      throw new Error('Suggestion not found.');
    }

    // Update database
    this.db.prepare(`
      UPDATE suggestions
      SET status = ?, response = ?, responded_by = ?, updated_at = ?
      WHERE guild_id = ? AND suggestion_id = ?
    `).run(status, response, respondedBy.id, Date.now(), guildId, suggestionId);

    // Update embed
    const config = this.getConfig(guildId);
    const channel = this.client.guilds.cache.get(guildId)?.channels.cache.get(config.channel_id);

    if (channel) {
      try {
        const message = await channel.messages.fetch(suggestion.message_id);
        const oldEmbed = message.embeds[0];

        let statusText = '⏳ Pending';
        let color = '#0099ff';

        if (status === 'approved') {
          statusText = '✅ Approved';
          color = '#00ff00';
        } else if (status === 'denied') {
          statusText = '❌ Denied';
          color = '#ff0000';
        } else if (status === 'implemented') {
          statusText = '🎉 Implemented';
          color = '#ffaa00';
        } else if (status === 'considering') {
          statusText = '🤔 Under Consideration';
          color = '#ffff00';
        }

        const embed = EmbedBuilder.from(oldEmbed)
          .setColor(color)
          .setFields(
            { name: 'Status', value: statusText, inline: true },
            { name: 'Response', value: response || 'No response provided', inline: false }
          );

        if (respondedBy) {
          embed.setFooter({ text: `Responded by ${respondedBy.tag} | ID: ${suggestionId}` });
        }

        await message.edit({ embeds: [embed] });
      } catch (error) {
        console.error('Error updating suggestion message:', error);
      }
    }

    return suggestion;
  }

  getSuggestion(guildId, suggestionId) {
    return this.db.prepare(
      'SELECT * FROM suggestions WHERE guild_id = ? AND suggestion_id = ?'
    ).get(guildId, suggestionId);
  }

  getSuggestionsByStatus(guildId, status) {
    return this.db.prepare(
      'SELECT * FROM suggestions WHERE guild_id = ? AND status = ? ORDER BY created_at DESC'
    ).all(guildId, status);
  }

  getAllSuggestions(guildId) {
    return this.db.prepare(
      'SELECT * FROM suggestions WHERE guild_id = ? ORDER BY created_at DESC'
    ).all(guildId);
  }

  getSuggestionStats(guildId) {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE guild_id = ?').get(guildId);
    const pending = this.db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE guild_id = ? AND status = ?').get(guildId, 'pending');
    const approved = this.db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE guild_id = ? AND status = ?').get(guildId, 'approved');
    const denied = this.db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE guild_id = ? AND status = ?').get(guildId, 'denied');
    const implemented = this.db.prepare('SELECT COUNT(*) as count FROM suggestions WHERE guild_id = ? AND status = ?').get(guildId, 'implemented');

    return {
      total: total?.count || 0,
      pending: pending?.count || 0,
      approved: approved?.count || 0,
      denied: denied?.count || 0,
      implemented: implemented?.count || 0,
    };
  }
}
