// Create New Ticket Command

export default {
  name: 'ticket',
  aliases: ['new-ticket', 'support'],
  description: 'Create a new support ticket',
  category: 'tickets',
  usage: 'ticket [topic]',
  cooldown: 60,
  guildOnly: true,

  async execute(client, message, args) {
    const topic = args.join(' ') || 'No topic provided';

    try {
      const { channel, ticketNumber } = await client.tickets.createTicket(message.guild, message.author, topic);

      await message.reply(`✅ Ticket #${ticketNumber} created! ${channel}`);
    } catch (error) {
      await message.reply(`❌ ${error.message}`);
    }
  },
};
