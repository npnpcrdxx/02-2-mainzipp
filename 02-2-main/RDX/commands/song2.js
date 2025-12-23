const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: 'song2',
    aliases: ['yt', 'ytmusic'],
    description: 'Download song/video from YouTube',
    credits: 'SARDAR RDX',
    usage: 'song2 [song name] [video]',
    category: 'Media',
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    if (!query) return send.reply("Please provide a song name.");

    const wantVideo = query.toLowerCase().endsWith(" video");
    const searchTerm = wantVideo ? query.replace(/ video$/i, "").trim() : query.trim();
    const format = wantVideo ? "video" : "audio";
    
    const frames = [
      "🩵▰▱▱▱▱▱▱▱▱▱ 10%",
      "💙▰▰▱▱▱▱▱▱▱▱ 25%",
      "💜▰▰▰▰▱▱▱▱▱▱ 45%",
      "💖▰▰▰▰▰▰▱▱▱▱ 70%",
      "💗▰▰▰▰▰▰▰▰▰▰ 100%"
    ];

    let loadingMsg;
    try {
      loadingMsg = await api.sendMessage(`🔍 Searching for "${searchTerm}"...\n${frames[0]}`, threadID);
    } catch {
      return send.reply("Error starting search.");
    }

    try {
      let yts;
      try {
        yts = require("yt-search");
      } catch {
        api.unsendMessage(loadingMsg.messageID);
        return send.reply("yt-search module not installed.");
      }
      
      const searchResults = await yts(searchTerm);
      const videos = searchResults.videos;

      if (!videos || videos.length === 0) {
        api.unsendMessage(loadingMsg.messageID);
        return send.reply("No results found.");
      }

      const first = videos[0];
      const title = first.title;
      const videoUrl = first.url;
      const author = first.author.name;

      try { await api.editMessage(`🎬 Found: ${title}\n\n${frames[1]}`, loadingMsg.messageID, threadID); } catch {}
      try { await api.editMessage(`📥 Downloading ${format}...\n\n${frames[2]}`, loadingMsg.messageID, threadID); } catch {}

      let fetchRes;
      try {
        const apiEndpoint = wantVideo ? 'ytmp4' : 'ytmp3';
        let apiUrl = `https://anabot.my.id/api/download/${apiEndpoint}?url=${encodeURIComponent(videoUrl)}&apikey=freeApikey`;
        if (wantVideo) {
          apiUrl += '&quality=360';
        }
        fetchRes = await axios.get(apiUrl, {
          headers: { 'Accept': 'application/json' },
          timeout: 60000
        });
      } catch (fetchError) {
        api.unsendMessage(loadingMsg.messageID);
        return send.reply(`Failed to fetch download link: ${fetchError.message}`);
      }

      if (!fetchRes.data.success || !fetchRes.data.data.result.urls) {
        api.unsendMessage(loadingMsg.messageID);
        return send.reply("Failed to get download URL");
      }

      const downloadUrl = fetchRes.data.data.result.urls;

      try { await api.editMessage(`🎵 Processing...\n\n${frames[3]}`, loadingMsg.messageID, threadID); } catch {}

      let downloadRes;
      try {
        downloadRes = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
          timeout: 180000
        });
      } catch (downloadError) {
        api.unsendMessage(loadingMsg.messageID);
        return send.reply(`Download failed: ${downloadError.message}`);
      }

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.${wantVideo ? "mp4" : "mp3"}`);
      fs.writeFileSync(filePath, downloadRes.data);

      try { await api.editMessage(`${frames[4]}\n✅ Complete!`, loadingMsg.messageID, threadID); } catch {}

      await send.reply({
        body: `🎶 ${title}\n📺 ${author}\n🔗 ${videoUrl}`,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(async () => {
        try {
          await fs.unlink(filePath);
          api.unsendMessage(loadingMsg.messageID);
        } catch {}
      }, 10000);

    } catch (err) {
      console.error("SONG2 ERROR:", err.message);
      if (loadingMsg) api.unsendMessage(loadingMsg.messageID);
      send.reply(`Error: ${err.message}`);
    }
  }
};
