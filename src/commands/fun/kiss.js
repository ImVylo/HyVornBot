// Kiss Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'kiss',
  description: 'Give someone a kiss',
  category: 'fun',
  usage: 'kiss <@user>',
  guildOnly: true,

  async execute(client, message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply('❌ Please mention someone to kiss!');
    }

    if (target.id === message.author.id) {
      return message.reply('You blow yourself a kiss! 😘');
    }

    const kissGifs = [
      'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
      'https://media.giphy.com/media/bm2O3nXTcKJeU/giphy.gif',
      'https://media.giphy.com/media/zkppEMFvRX5FC/giphy.gif',
      'https://media.giphy.com/media/FqBTvSNmc1mNG/giphy.gif',
      'https://media.giphy.com/media/11siFJObXbYP1C/giphy.gif',
    ];

    const randomGif = kissGifs[Math.floor(Math.random() * kissGifs.length)];

    const embed = new EmbedBuilder()
      .setColor('#ff1493')
      .setDescription(`💋 ${message.author} kissed ${target}!`)
      .setImage(randomGif)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
