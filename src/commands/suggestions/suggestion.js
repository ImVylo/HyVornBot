// Manage Suggestion Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'suggestion',
  aliases: ['sug'],
  description: 'Manage suggestions (approve, deny, consider, implement)',
  category: 'suggestions',
  usage: 'suggestion <approve|deny|consider|implement> <id> [response]',
  permissions: ['ManageGuild'],
  guildOnly: true,

  async execute(client, message, args) {
    if (args.length < 2) {
      return message.reply('❌ Usage: `suggestion <approve|deny|consider|implement> <id> [response]`');
    }

    const action = args[0].toLowerCase();
    const suggestionId = parseInt(args[1]);
    const response = args.slice(2).join(' ') || 'No response provided';

    if (!['approve', 'deny', 'consider', 'implement'].includes(action)) {
      return message.reply('❌ Invalid action. Use: `approve`, `deny`, `consider`, or `implement`');
    }

    if (isNaN(suggestionId)) {
      return message.reply('❌ Invalid suggestion ID.');
    }

    const statusMap = {
      approve: 'approved',
      deny: 'denied',
      consider: 'considering',
      implement: 'implemented',
    };

    try {
      await client.suggestions.updateSuggestionStatus(
        message.guild.id,
        suggestionId,
        statusMap[action],
        response,
        message.author
      );

      await message.reply(`✅ Suggestion #${suggestionId} has been marked as **${statusMap[action]}**.`);
    } catch (error) {
      await message.reply(`❌ ${error.message}`);
    }
  },
};
