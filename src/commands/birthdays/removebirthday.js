// Remove Birthday Command

export default {
  name: 'removebirthday',
  aliases: ['deletebirthday', 'unsetbirthday'],
  description: 'Remove your birthday',
  category: 'birthdays',
  usage: 'removebirthday',
  guildOnly: true,

  async execute(client, message, args) {
    const birthday = client.birthdays.getBirthday(message.author.id, message.guild.id);

    if (!birthday) {
      return message.reply('❌ You have not set a birthday.');
    }

    client.birthdays.removeBirthday(message.author.id, message.guild.id);

    await message.reply('✅ Your birthday has been removed.');
  },
};
