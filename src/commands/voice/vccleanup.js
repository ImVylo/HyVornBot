// Cleanup Orphaned Temp Voice Channels

export default {
  name: 'vccleanup',
  aliases: ['voice-cleanup', 'cleanupvc'],
  description: 'Clean up orphaned temporary voice channels',
  category: 'voice',
  usage: 'vccleanup',
  permissions: ['Administrator'],
  guildOnly: true,

  async execute(client, message, args) {
    const msg = await message.reply('🔄 Cleaning up temporary voice channels...');

    try {
      const cleaned = await client.tempVoice.cleanupOrphanedChannels(message.guild);
      await msg.edit(`✅ Cleaned up ${cleaned} orphaned temporary voice channel(s).`);
    } catch (error) {
      await msg.edit('❌ Failed to clean up channels.');
      client.logger.error('VCCleanup', 'Failed to cleanup channels:', error);
    }
  },
};
