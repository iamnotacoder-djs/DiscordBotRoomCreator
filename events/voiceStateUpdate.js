const 	{ MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(client, oldState, newState) {
        await Log.init(client);
        const   newMember = newState.member,
                oldMember = oldState.member;
        let member = newMember ?? oldMember,
            guild = newMember?.guild ?? oldMember?.guild;
        if (member.id != client.user.id && newMember?.voice?.channel != undefined && !newMember.user.bot) {
            let voiceChannelID = client.db.get(`guilds.g${guild.id}.category.voice.id`) ?? '0';
            if (member?.voice?.channel?.id == voiceChannelID) {
                const lang = client.db.get(`guilds.g${guild.id}.lang`) ?? 'en';
                const voiceChannel = await guild.channels.create(`${Config.strings.channel_name[lang]} ${member.displayName}`, {
                    type: 'GUILD_VOICE'
                });
                voiceChannel.setParent(client.db.get(`guilds.g${guild.id}.category.folder.id`));
                member.voice.setChannel(voiceChannel);
                if ([null, undefined].includes(client.db.get(`guilds.g${guild.id}.channels`))) client.db.set(`guilds.g${guild.id}.category.text.id`, []);
                guild.channels.fetch(client.db.get(`guilds.g${guild.id}.category.text.id`) ?? '0')
                    .then(async (textChannel) => {
                        const invite = await textChannel.createInvite({ temporary: true });
                        const message = await textChannel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle(Config.strings.bot_name[lang])
                                    .setDescription(Config.strings.channel_notification[lang].replace('{0}', `https://discord.gg/${invite.code}`))
                                    .setFooter({
                                        text: '/roomcreator'
                                    })
                                    .setColor(Config.embed_color)
                            ],
                            components: [
                                new MessageActionRow()
                                    .addComponents([
                                        new MessageButton()
                                            .setCustomId('cmd_rc_name')
                                            .setEmoji(`✏️`)
                                            .setStyle('SECONDARY'),
                                        new MessageButton()
                                            .setCustomId('cmd_rc_limit')
                                            .setEmoji(`🫂`)
                                            .setStyle('SECONDARY'),
                                        new MessageButton()
                                            .setCustomId('cmd_rc_lock')
                                            .setEmoji(`🔒`)
                                            .setStyle('SECONDARY')
                                    ])
                            ]
                        });
                        client.db.push(`guilds.g${guild.id}.channels`, {
                            owner: member.id,
                            voice: voiceChannel.id,
                            text: textChannel.id,
                            message: message.id
                        })
                    })
                    .catch((err) => {
                        client.db.push(`guilds.g${guild.id}.channels`, {
                            owner: member.id,
                            voice: voiceChannel.id
                        })
                    });
            }
        } else {
            const channels = client.db.get(`guilds.g${guild.id}.channels`);
            let newChannels = [];
            for(let i = 0; i < channels.length; i++) {
                let channel = await guild.channels.fetch(channels[i].voice)
                    .catch(() => {
                        // do nothing
                    });
                if (channel?.id != undefined) {
                    if (channel.members.size != 0) {
                        newChannels.push(channels[i]);
                    } else {
                        channel.delete();
                        if (channels[i].text != undefined && channels[i].message != undefined) {
                            guild.channels.fetch(channels[i].text)
                                .then((textChannel) => {
                                    textChannel.messages.fetch(channels[i].message)
                                        .then((message) => {
                                            message.delete();
                                        })
                                        .catch(() => {
                                            // do nothing
                                        });
                                })
                                .catch(() => {
                                    // do nothing
                                });
                        }
                    }
                } else {
                    guild.channels.fetch(channels[i].text)
                        .then((textChannel) => {
                            textChannel.messages.fetch(channels[i].message)
                                .then((message) => {
                                    message.delete();
                                })
                                .catch(() => {
                                    // do nothing
                                });
                        })
                        .catch(() => {
                            // do nothing
                        });
                }
            }
            client.db.set(`guilds.g${guild.id}.channels`, newChannels);
        }
    }
}