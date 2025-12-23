module.exports = {
  config: {
    name: 'approve',
    aliases: ['approvemsgs', 'approvemessages'],
    description: 'Approve group to receive Islamic messages',
    credits: 'SARDAR RDX',
    usage: 'approve [threadID]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, Threads }) {
    const { threadID } = event;
    const targetThread = args[0] || threadID;
    
    if (!/^\d+$/.test(targetThread)) {
      return send.reply('Please provide a valid thread ID.');
    }
    
    if (Threads.isApprovedForMessages(targetThread)) {
      return send.reply('This group is already approved for messages.');
    }
    
    Threads.approveMessages(targetThread);
    
    let groupName = 'Unknown';
    try {
      const info = await api.getThreadInfo(targetThread);
      groupName = info.threadName || 'Unknown';
    } catch {}
    
    if (targetThread !== threadID) {
      api.sendMessage(`This group has been approved for Islamic messages! You'll now receive Quran and Namaz updates.`, targetThread);
    }
    
    return send.reply(`✅ Approved for messages: ${groupName} (${targetThread})`);
  }
};
