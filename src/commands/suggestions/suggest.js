// Submit Suggestion Command

export default {
  name: 'suggest',
  aliases: ['suggestion'],
  description: 'Submit a suggestion',
  category: 'suggestions',
  usage: 'suggest <your suggestion>',
  guildOnly: true,

  async execute(client, message, args) {
    if (args.length === 0) {
      return message.reply('❌ Please provide your suggestion. Usage: `suggest <your suggestion>`');
    }

    const content = args.join(' ');

    if (content.length > 1024) {
      return message.reply('❌ Suggestion is too long! Please keep it under 1024 characters.');
    }

    try {
      const { suggestionNumber, message: suggestionMsg } = await client.suggestions.createSuggestion(
        message.guild,
        message.author,
        content
      );

      await message.reply(`✅ Your suggestion (#${suggestionNumber}) has been submitted! ${suggestionMsg.url}`);
    } catch (error) {
      await message.reply(`❌ ${error.message}`);
    }
  },
};
