const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Express app!');
});

app.listen(3000, () => {
  console.log('\033[32m server started');
});

const Discord = require('discord.js');
const client = new Discord.Client();

const distube = require('distube');
client.distube = new distube(client, {
  searchSongs: false,
  emitNewSongOnly: true,
  youtubeDL: true,
  updateYouTubeDL: true,
});
require("@discordjs/opus");
require("ffmpeg-static");
require("ytdl-core");

//////////////////
const prefix = "규아야 "
/////////////////

const webhookUrl = process.env.WEBHOOK; // 여기에 특정 웹훅의 URL을 넣어주세요

client.on('guildCreate', (guild) => {
  // 봇이 서버에 추가되었을 때 이벤트를 처리합니다.
  const serverCount = client.guilds.cache.size;
  const serverLink = `https://discord.com/invite/${guild.id}`;
  const serverName = guild.name;

  // 특정 웹훅으로 메시지를 보냅니다.
  const webhook = new Discord.WebhookClient({ url: webhookUrl });
  webhook.send(`봇이 추가되었습니다! 서버 수: ${serverCount}, 서버 링크: ${serverLink}, 서버 이름: ${serverName}`);
});

client.on("ready", () => {
  console.log(`${client.user.tag} is ready`);

  // 초기 활동 설정
  setActivity();

  // 6초마다 활동 변경
  setInterval(() => {
    setActivity();
  }, 15000);
});

// 활동 설정 함수
function setActivity() {
  const totalGuilds = client.guilds.cache.size;
  const totalUsers = client.users.cache.size;

  const activities = [
    { type: "PLAYING", name: `규아야 명령어` },
    { type: "PLAYING", name: `버전:v1` },
    { type: "WATCHING", name: `규아는 노래` },
    { type: "WATCHING", name: `접두사는 규아야` },
    { type: "PLAYING", name: `규아 노래방!` },
    { type: "WATCHING", name: `오류문의는 규아디엠!` },
    // 다른 활동을 추가할 수 있습니다.
  ];

  const randomActivity = activities[Math.floor(Math.random() * activities.length)];

  client.user.setActivity(randomActivity);
}


client.on("message", message => {
  if (message.content === prefix + "명령어") {
    const embed = new Discord.MessageEmbed()
      .setTitle("명령어 목록!")
      .setColor("BLUE")
      .setThumbnail(client.user.avatarURL())
      .addField(`\`${prefix}재생\``, "To Playing Song", true)
      .addField(`\`${prefix}나가 / 전체취소\``, "To Stoping Song", true)
      .addField(`\`${prefix}스킵\``, "To Skiping Song", true)
      .addField(`\`${prefix}재정\``, "To Paused Song", true)
      .addField(`\`${prefix}리슘\``, "To Resumed Song", true)
      .addField(`\`${prefix}재생목록 / 큐\``, "To View Queue Song", true)
      .addField(`\`${prefix}현재\``, "To View Now Playing", true)
      .addField(`\`${prefix}반복재생 / 반복\``, "To Change Repeat Mode (off, song, queue)", true)

      .setFooter(`규아 노래방`)
    message.channel.send(embed)
  }
  if (message.content.startsWith(prefix + "재생")) {
    const args = message.content
      .split(' ')
      .slice(1)
      .join(' ');
    if (!args) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌  에러")
      .setColor("RED")
      .setDescription(`노래 이름이나 URL을 입력하세요`)

    );
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle("❌  에러")
        .setColor("RED")
        .setDescription(`음성채널에 참여해주세요`)

      );
    try {
      client.distube.play(message, args);


    } catch (e) {
      const embed = new Discord.MessageEmbed()
        .setTitle("❌ Error")
        .setColor("RED")
        .setDescription(e)
      message.channel.send(embed)
    }
  }
  if (message.content === prefix + "전체취소" || message.content.startsWith(prefix + "나가")) {
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle("❌  Error")
        .setColor("BLUE")
        .setDescription(`Please Join Voice Channel`)

      );
    const queue = client.distube.getQueue(message)
    if (!queue) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌ Error")
      .setColor("RED")
      .setDescription("There is nothing in the queue right now!"))
    client.distube.stop(message);
    const embed = new Discord.MessageEmbed()
      .setTitle("⏸️  Stop")
      .setColor("RED")
      .setDescription(`The song has been successfully Stoped`)
    message.channel.send(embed)
  }
  if (message.content === prefix + "스킵") {
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle("❌  Error")
        .setColor("RED")
        .setDescription(`Please Join Voice Channel`)

      );
    const queue = client.distube.getQueue(message)
    if (!queue) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌ Error")
      .setColor("RED")
      .setDescription("There is nothing in the queue right now!"))
    try {
      client.distube.skip(message);
      const embed = new Discord.MessageEmbed()
        .setTitle("⏭️  Skip")
        .setColor("BLUE")
        .setDescription(`The song has been successfully Skiped`)
      message.channel.send(embed)
    } catch (e) {
      const embed = new Discord.MessageEmbed()
        .setTitle("❌ Error")
        .setColor("RED")
        .setDescription(e)
      message.channel.send(embed)
    }
  }
  if (message.content === prefix + "반복재생" || message.content.startsWith(prefix + "반복")) {
    const args = message.content.split(" ")
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle("❌  Error")
        .setColor("RED")
        .setDescription(`Please Join Voice Channel`)

      );
    const queue = client.distube.getQueue(message)
    if (!queue) return message.channel.send(`There is nothing playing!`)
    let mode = null
    switch (args[0]) {
      case "off":
        mode = 0
        break
      case "song":
        mode = 1
        break
      case "queue":
        mode = 2
        break
    }
    mode = client.distube.setRepeatMode(message, mode)
    mode = mode ? mode === 2 ? "Repeat queue" : "Repeat song" : "Off"
    const embed = new Discord.MessageEmbed()
      .setTitle("🔄  Repeat")
      .setColor("RED")
      .setDescription(`Set Repeat Mode To \`${mode}\``)
    message.channel.send(embed)
  }
  if (message.content === prefix + "재생목록" || message.content.startsWith(prefix + "큐")) {
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle("❌  Error")
        .setColor("RED")
        .setDescription(`Please Join Voice Channel`)

      );
    let queue = client.distube.getQueue(message);
    if (!queue) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌ Error")
      .setColor("RED")
      .setDescription("There is nothing in the queue right now!"))
    const embed = new Discord.MessageEmbed()
      .setTitle("Current Queue :")
      .setColor("BLUE")
      .setDescription(queue.songs.map((song, id) =>
        `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
      ).slice(0, 10).join("\n"))
    message.channel.send(embed)

  }
  if (message.content === prefix + "현재") {
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle("❌  Error")
        .setColor("RED")
        .setDescription(`Please Join Voice Channel`)

      );
    let queue = client.distube.getQueue(message);
    if (!queue) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌ Error")
      .setColor("RED")
      .setDescription("There is nothing in the queue right now!"))
    const embed = new Discord.MessageEmbed()
      .setTitle(" Now Playing:")
      .setColor("BLUE")
      .setDescription(queue.songs.map((song, id) =>
        `${song.name} - \`${song.formattedDuration}\``
      ).slice(0, 1).join("\n"))
    message.channel.send(embed)

  }
  if (message.content === prefix + "볼륨설정" || message.content.startsWith(prefix + "볼륨")) {
    const args = message.content.split(" ")
    if (!args) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌  Error")
      .setColor("RED")
      .setDescription(`Please Type Number To Set Volume`)
    );
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .seTitle("❌  Error")
        .setColor("RED")
        .setDescription(`Please Join Voice Channel`)

      );
    const queue = client.distube.getQueue(message)
    if (!queue) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌ Error")
      .setColor("RED")
      .setDescription("There is nothing in the queue right now!"))
    const volume = parseInt(args[1])
    if (isNaN(volume)) return message.channel.send(` Please enter a valid number!`)
    if (volume > 100) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌  Error")
      .setColor("RED")
      .setDescription(`The Max Volume is \`100\``)
    )
    client.distube.setVolume(message, volume)
    const embed = new Discord.MessageEmbed()
      .setTitle("🔊  Volume")
      .setColor("RED")
      .setDescription(`Volume set to \`${volume}\``)
    message.channel.send(embed)
  }
  if (message.content === prefix + "재정") {
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .seTitle("❌  Error")
        .setColor("RED")
        .setDescription(`Please Join Voice Channel`)

      );
    const queue = client.distube.getQueue(message)
    if (!queue) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌ Error")
      .setColor("RED")
      .setDescription("There is nothing in the queue right now!"))
    if (queue.pause) {
      client.distube.resume(message)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle("▶️  Resumed")
        .setColor("RED")
        .setDescription(`Resumed the song for you`)
      )

    }
    client.distube.pause(message)
    const embed = new Discord.MessageEmbed()
      .setTitle("⏸️  Paused")
      .setColor("RED")
      .setDescription(`Paused the song for you`)
    message.channel.send(embed)
  }
  if (message.content === prefix + "리슘") {
    if (!message.member.voice.channel)
      return message.channel.send(new Discord.MessageEmbed()
        .setTitle("❌  Error")
        .setColor("RED")
        .setDescription(`Please Join Voice Channel`)

      );
    const queue = client.distube.getQueue(message)
    if (!queue) return message.channel.send(new Discord.MessageEmbed()
      .setTitle("❌ Error")
      .setColor("RED")
      .setDescription("There is nothing in the queue right now!"))
    client.distube.resume(message)
    const embed = new Discord.MessageEmbed()
      .setTitle("▶️  Resumed")
      .setColor("RED")
      .setDescription(`Resumed the song for you`)
    message.channel.send(embed)

  }

});
const status = queue =>
  `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter ||
  'Off'}\` | Loop: \`${queue.repeatMode
    ? queue.repeatMode == 2
      ? 'All Queue'
      : 'This Song'
    : 'Off'
  }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;

client.distube
  .on("finish", message => message.guild.me.voice.channel.leave())
  .on("empty", message => message.guild.me.voice.channel.leave())

  .on("initQueue", queue => {
    queue.autoplay = false;
    queue.volume = 100;
  })
  .on("noRelated", message => message.channel.send("Can't find related video to play. Stop playing music."))

  .on('playSong', (message, queue, song) =>
    message.channel.send({
      embed: {
        color: 0x0099ff,
        title: song.name,
        url: song.url,
        image: {
          url: song.thumbnail
        },
        fields: [
          {
            name: '🕘 Time',
            value: `\`${song.formattedDuration}\``,
            inline: true
          },
          {
            name: '👁️ Views Video',
            value: `\`${song.views}\``,
            inline: true
          },
        ],
        timestamp: new Date(),
        footer: {
          text: `${song.user.tag} 님이 곡을 트셨어요!`
        }
      }
    })

  )
  .on('addSong', (message, queue, song) => message.channel.send({
    embed: {
      color: 0x0099ff,
      title: song.name,
      url: song.url,
      image: {
        url: song.thumbnail
      },
      fields: [
        {
          name: '🕘 Time',
          value: `\`${song.formattedDuration}\``,
          inline: true
        },
        {
          name: '👁️ Views Video',
          value: `\`${song.views}\``,
          inline: true
        },
      ],
      timestamp: new Date(),
      footer: {
        text: `${song.user.tag} 님이 곡을 트셨어요!`
      }
    }
  })

  )
  .on("playList", (message, queue, playlist, song) =>

    message.channel.send({
      embed: {
        color: 0x0099ff,
        title: playlist.name,
        url: playlist.url,
        fields: [
          {
            name: '플레이리스트 목록',
            value: playlist.songs.length,
          },
          {
            name: "현재재생중",
            value: `${song.name} \`${song.formattedDuration}\``
          },
        ],
        image: {
          url: playlist.thumbnail.url,
        },
        timestamp: new Date(),
        footer: {
          text: `물음표 노래방`
        },
      }
    })


  )
  .on("addList", (message, queue, playlist, song) =>

    message.channel.send({
      embed: {
        color: 0x0099ff,
        title: playlist.name,
        url: playlist.url,
        fields: [
          {
            name: '플레이리스트 목록',
            value: playlist.songs.length,
          },

        ],
        image: {
          url: playlist.thumbnail.url,
        },
        timestamp: new Date(),
        footer: {
          text: `물음표 노래방`
        },
      }
    })
  )

  .on('error', (message, e) => {
    console.error(e);
    message.channel.send('An error encountered: ' + e);
  });

client.login(process.env.token).catch((err) => {
  console.warn("\033[31m Token Invalid")
})
