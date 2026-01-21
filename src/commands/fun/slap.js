// Slap Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'slap',
  description: 'Slap someone (playfully!)',
  category: 'fun',
  usage: 'slap <@user>',
  guildOnly: true,

  async execute(client, message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply('❌ Please mention someone to slap!');
    }

    if (target.id === message.author.id) {
      return message.reply('You slap yourself. That probably hurt! 🤕');
    }

    const slapGifs = [
      'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif',
      'https://media.giphy.com/media/3XlEk2RxPS1m8/giphy.gif',
      'https://media.giphy.com/media/tX29X2Dx3sAXS/giphy.gif',
      'https://media.giphy.com/media/jLeyZWgtwgr2U/giphy.gif',
      'https://media.giphy.com/media/xUO4t2gkWBxDi/giphy.gif',
    ];

    const randomGif = slapGifs[Math.floor(Math.random() * slapGifs.length)];

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setDescription(`👋 ${message.author} slapped ${target}!`)
      .setImage(randomGif)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
