// Set Birthday Command

export default {
  name: 'birthday',
  aliases: ['bday', 'setbirthday'],
  description: 'Set your birthday',
  category: 'birthdays',
  usage: 'birthday <month> <day> [year]',
  guildOnly: true,

  async execute(client, message, args) {
    if (args.length < 2) {
      // Show user's birthday
      const birthday = client.birthdays.getBirthday(message.author.id, message.guild.id);

      if (!birthday) {
        return message.reply('❌ You have not set your birthday. Use `birthday <month> <day> [year]`');
      }

      const date = new Date(birthday.year || 2000, birthday.month - 1, birthday.day);
      const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      return message.reply(`🎂 Your birthday is set to **${formatted}**${birthday.year ? ` (${birthday.year})` : ''}`);
    }

    const month = parseInt(args[0]);
    const day = parseInt(args[1]);
    const year = args[2] ? parseInt(args[2]) : null;

    if (isNaN(month) || isNaN(day)) {
      return message.reply('❌ Invalid date format. Use: `birthday <month> <day> [year]`\nExample: `birthday 3 15` or `birthday 3 15 1995`');
    }

    try {
      client.birthdays.setBirthday(message.author.id, message.guild.id, month, day, year);

      const date = new Date(year || 2000, month - 1, day);
      const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      await message.reply(`✅ Your birthday has been set to **${formatted}**${year ? ` (${year})` : ''}! 🎉`);
    } catch (error) {
      await message.reply(`❌ ${error.message}`);
    }
  },
};
