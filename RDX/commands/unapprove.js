module.exports = {
  config: {
    name: 'disallow',
    aliases: ['reject', 'disapprove', 'unapprove'],
    description: 'Disallow a group',
    credits: 'SARDAR RDX',
    usage: 'disallow [threadID]',
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
    
    if (!Threads.isAllowed(targetThread)) {
      return send.reply('This group is not allowed.');
    }
    
    Threads.disallow(targetThread);
    
    let groupName = 'Unknown';
    try {
      const info = await api.getThreadInfo(targetThread);
      groupName = info.threadName || 'Unknown';
    } catch {}
    
    if (targetThread !== threadID) {
      api.sendMessage(`This group has been disallowed by bot admin.`, targetThread);
    }
    
    return send.reply(`Disallowed group: ${groupName} (${targetThread})`);
  }
};
