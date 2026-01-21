// List Suggestions Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'suggestions',
  aliases: ['listsuggestions', 'sugstats'],
  description: 'View suggestion statistics',
  category: 'suggestions',
  usage: 'suggestions [pending|approved|denied|implemented]',
  guildOnly: true,

  async execute(client, message, args) {
    const stats = client.suggestions.getSuggestionStats(message.guild.id);

    if (args.length === 0) {
      // Show statistics
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('💡 Suggestion Statistics')
        .addFields(
          { name: 'Total', value: stats.total.toString(), inline: true },
          { name: '⏳ Pending', value: stats.pending.toString(), inline: true },
          { name: '✅ Approved', value: stats.approved.toString(), inline: true },
          { name: '❌ Denied', value: stats.denied.toString(), inline: true },
          { name: '🎉 Implemented', value: stats.implemented.toString(), inline: true }
        )
        .setFooter({ text: `Server: ${message.guild.name}` })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // List suggestions by status
    const status = args[0].toLowerCase();
    const validStatuses = ['pending', 'approved', 'denied', 'implemented', 'considering'];

    if (!validStatuses.includes(status)) {
      return message.reply('❌ Invalid status. Use: `pending`, `approved`, `denied`, `considering`, or `implemented`');
    }

    const suggestions = client.suggestions.getSuggestionsByStatus(message.guild.id, status);

    if (suggestions.length === 0) {
      return message.reply(`❌ No ${status} suggestions found.`);
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`💡 ${status.charAt(0).toUpperCase() + status.slice(1)} Suggestions`)
      .setDescription(suggestions.slice(0, 10).map(s => {
        const user = this.client.users.cache.get(s.user_id);
        return `**#${s.suggestion_id}** by ${user?.tag || 'Unknown'}\n${s.content.substring(0, 100)}${s.content.length > 100 ? '...' : ''}`;
      }).join('\n\n'))
      .setFooter({ text: `Showing ${Math.min(suggestions.length, 10)} of ${suggestions.length} suggestions` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
