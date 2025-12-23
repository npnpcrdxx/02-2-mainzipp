module.exports = {
  config: {
    name: 'setnickall',
    aliases: ['nicknameall', 'setallnick'],
    description: 'Set nickname for all group members',
    credits: 'SARDAR RDX',
    usage: 'setnickall [nickname]',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, args, send }) {
    const newNickname = args.join(" ");
    if (!newNickname) {
      return send.reply("Please provide a new nickname.\nExample: setnickall RDX Army");
    }

    const threadInfo = await api.getThreadInfo(event.threadID);
    const allParticipants = threadInfo.participantIDs;

    let success = 0, failed = 0;

    for (const userID of allParticipants) {
      try {
        await api.changeNickname(newNickname, event.threadID, userID);
        success++;
      } catch (e) {
        failed++;
      }
    }

    return send.reply(`✅ Nickname changed for ${success} members.\n❌ Failed for ${failed} members.`);
  }
};
