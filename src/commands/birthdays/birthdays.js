// List Upcoming Birthdays Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'birthdays',
  aliases: ['bdays', 'upcoming-birthdays'],
  description: 'View upcoming birthdays',
  category: 'birthdays',
  usage: 'birthdays',
  guildOnly: true,

  async execute(client, message, args) {
    const birthdays = client.birthdays.getUpcomingBirthdays(message.guild.id, 15);

    if (birthdays.length === 0) {
      return message.reply('❌ No birthdays have been set in this server.');
    }

    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setTitle('🎂 Upcoming Birthdays')
      .setDescription('Here are the next birthdays in this server:')
      .setFooter({ text: `${birthdays.length} birthday(s) set` })
      .setTimestamp();

    const lines = [];
    for (const birthday of birthdays) {
      const member = await message.guild.members.fetch(birthday.user_id).catch(() => null);
      if (!member) continue;

      const date = new Date(birthday.year || 2000, birthday.month - 1, birthday.day);
      const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const age = birthday.year ? ` (turning ${new Date().getFullYear() - birthday.year})` : '';
      lines.push(`${formatted} - ${member.user.tag}${age}`);
    }

    embed.setDescription(lines.join('\n') || 'No upcoming birthdays');

    await message.reply({ embeds: [embed] });
  },
};
