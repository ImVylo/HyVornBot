// Pat Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'pat',
  description: 'Pat someone on the head',
  category: 'fun',
  usage: 'pat <@user>',
  guildOnly: true,

  async execute(client, message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply('❌ Please mention someone to pat!');
    }

    if (target.id === message.author.id) {
      return message.reply('You pat yourself on the head. Good job! 👏');
    }

    const patGifs = [
      'https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif',
      'https://media.giphy.com/media/109ltuoSQT212w/giphy.gif',
      'https://media.giphy.com/media/H4uE6w9G1uK4M/giphy.gif',
      'https://media.giphy.com/media/113RhN1oBm1yCc/giphy.gif',
      'https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif',
    ];

    const randomGif = patGifs[Math.floor(Math.random() * patGifs.length)];

    const embed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setDescription(`👋 ${message.author} patted ${target} on the head!`)
      .setImage(randomGif)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
