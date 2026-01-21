// Hug Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'hug',
  description: 'Give someone a hug',
  category: 'fun',
  usage: 'hug <@user>',
  guildOnly: true,

  async execute(client, message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply('❌ Please mention someone to hug!');
    }

    if (target.id === message.author.id) {
      return message.reply('You can\'t hug yourself! But here\'s a virtual hug 🤗');
    }

    const hugGifs = [
      'https://media.giphy.com/media/3bqtLDeiDtwhq/giphy.gif',
      'https://media.giphy.com/media/143v0Z4767T15e/giphy.gif',
      'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
      'https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif',
      'https://media.giphy.com/media/PHZ7v9tfQu0o0/giphy.gif',
    ];

    const randomGif = hugGifs[Math.floor(Math.random() * hugGifs.length)];

    const embed = new EmbedBuilder()
      .setColor('#ff69b4')
      .setDescription(`🤗 ${message.author} hugged ${target}!`)
      .setImage(randomGif)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
