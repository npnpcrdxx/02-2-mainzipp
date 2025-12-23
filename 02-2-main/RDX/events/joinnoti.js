module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.0",
    credits: "SARDAR RDX",
    description: "Send message when bot joins group and notify admin group"
};

module.exports.run = async function({ api, event, config }) {
    const { threadID, logMessageData } = event;
    const botID = api.getCurrentUserID();
    const NOTIFY_GROUP = "9127321610634774"; // Your notification group
    
    // Check if bot was added to group
    if (logMessageData.addedParticipants.some(i => i.userFbId == botID)) {
        const botnick = config.BOTNICK || `{ ${config.PREFIX} } × ${config.BOTNAME || "bot"}`;
        
        try {
            await api.changeNickname(botnick, threadID, botID);
        } catch (e) {
            console.log("[JOIN_NOTI] Nickname error:", e.message);
        }
        
        // Send welcome message to the group bot joined
        try {
            await api.sendMessage("Hello Everyone🙋‍♂️ 𝐁𝐨𝐭 𝐢𝐬 𝐍𝐨𝐰 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝⛓️", threadID);
            console.log("[JOIN_NOTI] Welcome message sent to group:", threadID);
        } catch (e) {
            console.log("[JOIN_NOTI] Welcome message error:", e.message);
        }
        
        // Send notification to notification group
        try {
            let threadInfo = { threadName: "Unknown Group" };
            try {
                threadInfo = await api.getThreadInfo(threadID);
            } catch (e) {}
            
            const groupName = threadInfo.threadName || "Unknown Group";
            const memberCount = threadInfo.participantIDs?.length || 0;
            
            const notifyMsg = `✅ BOT ADDED TO GROUP
─────────────────
📌 Group: ${groupName}
🆔 Thread ID: ${threadID}
👥 Members: ${memberCount}
─────────────────
Type ${config.PREFIX}help for commands!`;
            
            // Send notification to the notification group
            await api.sendMessage(notifyMsg, NOTIFY_GROUP);
            console.log("[JOIN_NOTI] Notification sent to group:", NOTIFY_GROUP);
            
        } catch (e) {
            console.log("[JOIN_NOTI] Notification error:", e.message);
        }
    }
    
    // Notify about other members being added to the group
    if (logMessageData.addedParticipants.length > 0) {
        for (const participant of logMessageData.addedParticipants) {
            if (participant.userFbId != botID) {
                try {
                    const userInfo = await api.getUserInfo(participant.userFbId);
                    const userName = userInfo[participant.userFbId]?.name || participant.userFbId;
                    const userID = participant.userFbId;
                    
                    let threadInfo = { threadName: "Unknown Group" };
                    try {
                        threadInfo = await api.getThreadInfo(threadID);
                    } catch (e) {}
                    
                    const groupName = threadInfo.threadName || "Unknown Group";
                    
                    const memberNotifyMsg = `➕ MEMBER ADDED
─────────────────
👤 Name: ${userName}
🆔 UID: ${userID}
📌 Group: ${groupName}
🆔 Thread ID: ${threadID}
─────────────────`;
                    
                    await api.sendMessage(memberNotifyMsg, NOTIFY_GROUP);
                    console.log("[JOIN_NOTI] Member added notification sent:", userID);
                } catch (e) {
                    console.log("[JOIN_NOTI] Member notification error:", e.message);
                }
            }
        }
    }
};
