// Close Ticket Command

export default {
  name: 'close',
  aliases: ['close-ticket'],
  description: 'Close the current ticket',
  category: 'tickets',
  usage: 'close [reason]',
  permissions: ['ManageChannels'],
  guildOnly: true,

  async execute(client, message, args) {
    const reason = args.join(' ') || 'No reason provided';

    try {
      await client.tickets.closeTicket(message.channel, message.author, reason);
    } catch (error) {
      await message.reply(`❌ ${error.message}`);
    }
  },
};
