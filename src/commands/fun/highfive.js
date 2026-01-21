// High Five Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'highfive',
  aliases: ['high5', 'hi5'],
  description: 'Give someone a high five',
  category: 'fun',
  usage: 'highfive <@user>',
  guildOnly: true,

  async execute(client, message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply('❌ Please mention someone to high five!');
    }

    if (target.id === message.author.id) {
      return message.reply('You high five yourself! ✋');
    }

    const highfiveGifs = [
      'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
      'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
      'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif',
      'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
      'https://media.giphy.com/media/l0ErFgOht0LZMHjRm/giphy.gif',
    ];

    const randomGif = highfiveGifs[Math.floor(Math.random() * highfiveGifs.length)];

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setDescription(`✋ ${message.author} high fived ${target}!`)
      .setImage(randomGif)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
