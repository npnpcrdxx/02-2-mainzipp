module.exports = {
  config: {
    name: 'disapprove',
    aliases: ['disapprovemsgs', 'unapprovemsg', 'removemsgs'],
    description: 'Disapprove group from receiving Islamic messages',
    credits: 'SARDAR RDX',
    usage: 'disapprove [threadID]',
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
    
    if (!Threads.isApprovedForMessages(targetThread)) {
      return send.reply('This group is not approved for messages.');
    }
    
    Threads.disapproveMessages(targetThread);
    
    let groupName = 'Unknown';
    try {
      const info = await api.getThreadInfo(targetThread);
      groupName = info.threadName || 'Unknown';
    } catch {}
    
    if (targetThread !== threadID) {
      api.sendMessage(`This group has been removed from Islamic message list.`, targetThread);
    }
    
    return send.reply(`❌ Disapproved for messages: ${groupName} (${targetThread})`);
  }
};
