// Poke Command

import { EmbedBuilder } from 'discord.js';

export default {
  name: 'poke',
  description: 'Poke someone',
  category: 'fun',
  usage: 'poke <@user>',
  guildOnly: true,

  async execute(client, message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply('❌ Please mention someone to poke!');
    }

    if (target.id === message.author.id) {
      return message.reply('You poke yourself. Why? 🤔');
    }

    const pokeGifs = [
      'https://media.giphy.com/media/pWD819DfsUznO/giphy.gif',
      'https://media.giphy.com/media/QLX7K2aKZZPWw/giphy.gif',
      'https://media.giphy.com/media/3OymWKuyc2y2BumvVa/giphy.gif',
      'https://media.giphy.com/media/Vr8xM1OgUYhtAtLp6n/giphy.gif',
      'https://media.giphy.com/media/EgJf75uN8TG9i/giphy.gif',
    ];

    const randomGif = pokeGifs[Math.floor(Math.random() * pokeGifs.length)];

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(`👉 ${message.author} poked ${target}!`)
      .setImage(randomGif)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
