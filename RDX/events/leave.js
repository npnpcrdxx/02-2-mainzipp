module.exports = {
  config: {
    name: 'leave',
    eventType: 'log:unsubscribe',
    description: 'Goodbye messages, anti-out, and bot removal notifications'
  },
  
  async run({ api, event, send, Users, Threads, config }) {
    const { threadID, logMessageData } = event;
    const leftParticipantFbId = logMessageData.leftParticipantFbId;
    const botID = api.getCurrentUserID();
    const NOTIFY_GROUP = "9127321610634774"; // Your notification group
    
    // If BOT was removed from group, notify notification group
    if (leftParticipantFbId === botID) {
      try {
        let threadInfo = { threadName: "Unknown Group" };
        try {
          threadInfo = await api.getThreadInfo(threadID);
        } catch (e) {}
        
        const groupName = threadInfo.threadName || "Unknown Group";
        
        const notifyMsg = `❌ BOT REMOVED FROM GROUP
─────────────────
📌 Group: ${groupName}
🆔 Thread ID: ${threadID}
─────────────────`;
        
        // Send notification to the notification group
        try {
          await api.sendMessage(notifyMsg, NOTIFY_GROUP);
          console.log("[LEAVE_EVENT] Removal notification sent to group:", NOTIFY_GROUP);
        } catch (err) {
          console.log("[LEAVE_EVENT] Error sending notification:", err.message);
        }
        
      } catch (e) {
        console.log("[LEAVE_EVENT] Bot removal error:", e.message);
      }
      return;
    }
    
    // Handle member leaving (existing functionality)
    const settings = Threads.getSettings(threadID);
    
    let name = null;
    try {
      const info = await api.getUserInfo(leftParticipantFbId);
      if (info && info[leftParticipantFbId]) {
        const fullName = info[leftParticipantFbId].name;
        const firstName = info[leftParticipantFbId].firstName;
        const alternateName = info[leftParticipantFbId].alternateName;
        
        if (fullName && !fullName.toLowerCase().includes('facebook') && fullName.toLowerCase() !== 'user') {
          name = fullName;
        } else if (firstName && !firstName.toLowerCase().includes('facebook') && firstName.toLowerCase() !== 'user') {
          name = firstName;
        } else if (alternateName && !alternateName.toLowerCase().includes('facebook') && alternateName.toLowerCase() !== 'user') {
          name = alternateName;
        }
      }
    } catch {}
    
    if (!name) {
      name = await Users.getNameUser(leftParticipantFbId);
    }
    
    if (!name || name.toLowerCase().includes('facebook') || name === 'User') {
      name = 'Member';
    }
    
    if (settings.antiout) {
      try {
        await api.addUserToGroup(leftParticipantFbId, threadID);
        send.send(`🔒 ${name}, you can't leave! Anti-out is enabled.`, threadID);
        return;
      } catch {}
    }
    
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch {
      threadInfo = { participantIDs: [] };
    }
    
    const memberCount = threadInfo.participantIDs?.length || 0;
    
    const goodbyeMsg = `👋 MEMBER LEFT
─────────────────
${name} has left the group
─────────────────
👥 Remaining: ${memberCount} members`;
    
    send.send(goodbyeMsg, threadID);
    
    // Send notification to notification group about member leaving
    try {
      const groupName = threadInfo.threadName || "Unknown Group";
      const memberNotifyMsg = `➖ MEMBER LEFT
─────────────────
👤 Name: ${name}
🆔 UID: ${leftParticipantFbId}
📌 Group: ${groupName}
🆔 Thread ID: ${threadID}
👥 Remaining: ${memberCount} members
─────────────────`;
      
      await api.sendMessage(memberNotifyMsg, NOTIFY_GROUP);
      console.log("[LEAVE_EVENT] Member removal notification sent:", leftParticipantFbId);
    } catch (e) {
      console.log("[LEAVE_EVENT] Member notification error:", e.message);
    }
  }
};
