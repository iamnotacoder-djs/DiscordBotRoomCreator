'use strict';
const 	BaseCommand = require('../structures/BaseCommand'),
		{ MessageActionRow, MessageEmbed, MessageButton, TextInputComponent, Modal } = require('discord.js');

class RoomCreator extends BaseCommand {

    name = "roomcreator2";
    usage = "RoomCreator";
    type = [Config.CommandType.CHAT, Config.CommandType.SLASH_APPLICATION];
	category = [Config.CommandCategory.UNSET];
    bot_permissions = [
        'SEND_MESSAGES'
    ];
    slash = { 
        name: this.name, 
        description: this.usage, 
        type: `CHAT_INPUT`, 
        options: this.options, 
        defaultPermission: true 
    };
    componentsNames = ['cmd_rc_lang_en', 'cmd_rc_lang_ru', 'cmd_rc_admin', 'cmd_rc_lang_switch', 'cmd_rc_category', 'cmd_rc_category_folder', 'cmd_rc_category_text', 'cmd_rc_category_voice', 'cmd_rc_back_to_admin', 'cmd_rc_name', 'cmd_rc_limit', 'cmd_rc_lock'];

    constructor() {
        super();
    }

    async execute(client, command) {
		let lang = client.db.get(`guilds.g${command.guild.id}.lang`) ?? undefined;
		let components = [
			new MessageActionRow()
				.addComponents([
					new MessageButton()
						.setCustomId('cmd_rc_admin')
						.setLabel(`${Config.strings.admin_menu[lang ?? 'en']}`)
						.setStyle('PRIMARY')
				])
		];
		if (lang == undefined) {
			components[0].addComponents([
				new MessageButton()
					.setCustomId('cmd_rc_lang_en')
					.setEmoji('🇬🇧')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('cmd_rc_lang_ru')
					.setEmoji('🇷🇺')
					.setStyle('SECONDARY')
			])
		}
		let reply = this.getReply(0, lang);
		reply.components = (command.inGuild() && command.member.permissions.has('ADMINISTRATOR')) ? components : [];
		command.reply(reply);
    }

	getReply(id = 0, lang = 'en') {
		switch(id) {
			default: 
				return {
					embeds: [
						new MessageEmbed()
							.setTitle(Config.strings.bot_name[lang])
							.setDescription(Config.strings.bot_description[lang])
							.setFooter({
								text: '/roomcreator'
							})
							.setColor(Config.embed_color)
					],
					components: []
				};
			case 1: 
				return {
					embeds: [
						new MessageEmbed()
							.setTitle(Config.strings.bot_name[lang])
							.setDescription(Config.strings.admin_menu_description[lang])
							.setFooter({
								text: '/roomcreator'
							})
							.setColor(Config.embed_color)
					],
					components: [
						new MessageActionRow()
							.addComponents([
								new MessageButton()
									.setCustomId('cmd_rc_lang_switch')
									.setLabel(`${Config.strings.lang_switch[lang]}`)
									.setEmoji(Config.strings.lang_switch_emoji[lang])
									.setStyle('SECONDARY'), 
								new MessageButton()
									.setCustomId('cmd_rc_category')
									.setLabel(`${Config.strings.category[lang]}`)
									.setStyle('PRIMARY')
							])
					],
					ephemeral: true
				};
			case 2: 
				return {
					embeds: [
						new MessageEmbed()
							.setTitle(Config.strings.bot_name[lang])
							.setDescription(Config.strings.category_description[lang])
							.setFooter({
								text: '/roomcreator'
							})
							.setColor(Config.embed_color)
					],
					components: [
						new MessageActionRow()
							.addComponents([
								new MessageButton()
									.setCustomId('cmd_rc_back_to_admin')
									.setLabel(`<`)
									.setStyle('SECONDARY'),
								new MessageButton()
									.setCustomId('cmd_rc_category_folder')
									.setLabel(`${Config.strings.category_folder[lang]}`)
									.setStyle('PRIMARY'),
								new MessageButton()
									.setCustomId('cmd_rc_category_text')
									.setLabel(`${Config.strings.category_text[lang]}`)
									.setStyle('PRIMARY'),
								new MessageButton()
									.setCustomId('cmd_rc_category_voice')
									.setLabel(`${Config.strings.category_voice[lang]}`)
									.setStyle('PRIMARY')
							])
					],
					ephemeral: true
				};
		}
	}
	
    componentListener(client, interaction) {
		const lang = client.db.get(`guilds.g${interaction.guild.id}.lang`) ?? 'en';
		if (interaction.isButton()) {
			if (interaction.customId == "cmd_rc_lang_en") {
				client.db.set(`guilds.g${interaction.guild.id}.lang`, 'en');
				interaction.message.edit(this.getReply(0, 'en'));
			}
			if (interaction.customId == "cmd_rc_lang_ru") {
				client.db.set(`guilds.g${interaction.guild.id}.lang`, 'ru');
				interaction.message.edit(this.getReply(0, 'ru'));
			}
			if (interaction.customId == "cmd_rc_lang_switch") {
				let newLang = lang == 'ru' ? 'en' : 'ru';
				client.db.set(`guilds.g${interaction.guild.id}.lang`, newLang);
				let reply = this.getReply(1, lang);
				let description = reply.embeds[0].description;
				// client.db.get(`guilds.g${interaction.guild.id}.category.`)
				description = description.replace('{0}', interaction.guild.name);
				description = description.replace('{1}', lang);
				description = description.replace('{2}', client.db.get(`guilds.g${interaction.guild.id}.category.folder.name`) ?? 'unset');
				description = description.replace('{3}', client.db.get(`guilds.g${interaction.guild.id}.category.folder.id`) ?? 'unset');
				description = description.replace('{4}', client.db.get(`guilds.g${interaction.guild.id}.category.text.name`) ?? 'unset');
				description = description.replace('{5}', client.db.get(`guilds.g${interaction.guild.id}.category.text.id`) ?? 'unset');
				description = description.replace('{6}', client.db.get(`guilds.g${interaction.guild.id}.category.voice.name`) ?? 'unset');
				description = description.replace('{7}', client.db.get(`guilds.g${interaction.guild.id}.category.voice.id`) ?? 'unset');
				reply.embeds[0].description = description;
				interaction.update(reply);
				return true;
			}
			if (["cmd_rc_admin", "cmd_rc_back_to_admin"].includes(interaction.customId)) {
				let reply = this.getReply(1, lang);
				let description = reply.embeds[0].description;
				// client.db.get(`guilds.g${interaction.guild.id}.category.`)
				description = description.replace('{0}', interaction.guild.name);
				description = description.replace('{1}', lang);
				description = description.replace('{2}', client.db.get(`guilds.g${interaction.guild.id}.category.folder.name`) ?? 'unset');
				description = description.replace('{3}', client.db.get(`guilds.g${interaction.guild.id}.category.folder.id`) ?? 'unset');
				description = description.replace('{4}', client.db.get(`guilds.g${interaction.guild.id}.category.text.name`) ?? 'unset');
				description = description.replace('{5}', client.db.get(`guilds.g${interaction.guild.id}.category.text.id`) ?? 'unset');
				description = description.replace('{6}', client.db.get(`guilds.g${interaction.guild.id}.category.voice.name`) ?? 'unset');
				description = description.replace('{7}', client.db.get(`guilds.g${interaction.guild.id}.category.voice.id`) ?? 'unset');
				reply.embeds[0].description = description;
				if (interaction.customId == "cmd_rc_back_to_admin") {
					interaction.update(reply);
				} else {
					interaction.reply(reply);
				}
				return true;
			}
			if (interaction.customId == "cmd_rc_category") {
				let reply = this.getReply(2, lang);
				reply.components[0].components[1].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.folder.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
				
				reply.components[0].components[2].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.text.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
				
				reply.components[0].components[3].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.voice.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
				interaction.update(reply);
				return true;
			}
			if (interaction.customId == "cmd_rc_category_folder") {
				// lang
				interaction.showModal(
					new Modal()
						.setCustomId('cmd_rc_category_folder')
						.setTitle(Config.strings.category_folder[lang])
						.setComponents(
							new MessageActionRow()
								.addComponents(
									new TextInputComponent()
										.setCustomId('cmd_rc_category_folder')
										.setLabel(Config.strings.category_folder[lang])
										.setStyle('SHORT')
										.setMinLength(16)
										.setMaxLength(22)
										.setRequired(true)
								)
						)
				);
				return true;
			}
			if (interaction.customId == "cmd_rc_category_text") {
				// lang
				interaction.showModal(
					new Modal()
						.setCustomId('cmd_rc_category_text')
						.setTitle(Config.strings.category_text[lang])
						.setComponents(
							new MessageActionRow()
								.addComponents(
									new TextInputComponent()
										.setCustomId('cmd_rc_category_text')
										.setLabel(Config.strings.category_text[lang])
										.setStyle('SHORT')
										.setMinLength(16)
										.setMaxLength(22)
										.setRequired(true)
								)
						)
				);
				return true;
			}
			if (interaction.customId == "cmd_rc_category_voice") {
				// lang
				interaction.showModal(
					new Modal()
						.setCustomId('cmd_rc_category_voice')
						.setTitle(Config.strings.category_voice[lang])
						.setComponents(
							new MessageActionRow()
								.addComponents(
									new TextInputComponent()
										.setCustomId('cmd_rc_category_voice')
										.setLabel(Config.strings.category_voice[lang])
										.setStyle('SHORT')
										.setMinLength(16)
										.setMaxLength(22)
										.setRequired(true)
								)
						)
				);
				return true;
			}
			// 'cmd_rc_name', 'cmd_rc_limit', 'cmd_rc_lock'
			if (interaction.customId == "cmd_rc_name") {
				interaction.showModal(
					new Modal()
						.setCustomId('cmd_rc_name')
						.setTitle(Config.strings.channel_modal_name[lang])
						.setComponents(
							new MessageActionRow()
								.addComponents(
									new TextInputComponent()
										.setCustomId('cmd_rc_name')
										.setLabel(Config.strings.channel_modal_name[lang])
										.setStyle('SHORT')
										.setMinLength(2)
										.setMaxLength(32)
										.setRequired(true)
								)
						)
				);
				return true;
			}
			if (interaction.customId == "cmd_rc_limit") {
				interaction.showModal(
					new Modal()
						.setCustomId('cmd_rc_limit')
						.setTitle(Config.strings.channel_modal_limit[lang])
						.setComponents(
							new MessageActionRow()
								.addComponents(
									new TextInputComponent()
										.setCustomId('cmd_rc_limit')
										.setLabel(Config.strings.channel_modal_limit[lang])
										.setStyle('SHORT')
										.setMinLength(1)
										.setMaxLength(2)
										.setRequired(true)
								)
						)
				);
				return true;
			}
			if (interaction.customId == "cmd_rc_lock") {
				const channels = client.db.get(`guilds.g${interaction.guild.id}.channels`);				
				for(let i = 0; i < channels.length; i++) {
					if (channels[i].voice == interaction.member?.voice?.channel?.id && channels[i].owner == interaction.user.id) {
						// TODO лок/анлок
						if (interaction.member.voice.channel.permissionsLocked) {
							interaction.member.voice.channel.permissionOverwrites.create(interaction.guild.id, {
								'CONNECT': false
							});
						} else {
							interaction.member.voice.channel.lockPermissions();
						}
						interaction.reply({
							content: Config.strings.success_channel_limit[lang],
							ephemeral: true
						});
						return true;
					}
				}
				interaction.reply({
					content: Config.strings.error_channel_limit[lang],
					ephemeral: true
				});
				return true;
			}
		}
		if (interaction.isModalSubmit()) {
			if (interaction.customId == "cmd_rc_category_folder") {
				let id = interaction.fields.getTextInputValue('cmd_rc_category_folder');
				client.channels.fetch(id)
					.then((channel) => {
						if (channel.type == "GUILD_CATEGORY") {
							client.db.set(`guilds.g${interaction.guild.id}.category.folder`, {
								id: channel.id,
								name: channel.name
							});
							let reply = this.getReply(2, lang);
							reply.components[0].components[1].setStyle('SECONDARY');
							reply.components[0].components[2].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.text.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
							reply.components[0].components[3].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.voice.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
							interaction.update(reply);
						} else {
							interaction.reply({
								content: Config.strings.category_error[lang]
							});
						}
					})
					.catch(() => {
						interaction.reply({
							content: Config.strings.category_error[lang]
						});
					});
				return true;
			}		
			if (interaction.customId == "cmd_rc_category_text") {
				let id = interaction.fields.getTextInputValue('cmd_rc_category_text');
				client.channels.fetch(id)
					.then((channel) => {
						if (channel.type == "GUILD_TEXT") {
							client.db.set(`guilds.g${interaction.guild.id}.category.text`, {
								id: channel.id,
								name: channel.name
							});
							let reply = this.getReply(2, lang);
							reply.components[0].components[2].setStyle('SECONDARY');
							reply.components[0].components[1].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.folder.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
							reply.components[0].components[3].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.voice.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
							interaction.update(reply);
						} else {
							interaction.reply({
								content: Config.strings.category_error[lang],
								ephemeral: true
							});
						}
					})
					.catch(() => {
						interaction.reply({
							content: Config.strings.category_error[lang],
							ephemeral: true
						});
					});
				return true;
			}
			if (interaction.customId == "cmd_rc_category_voice") {
				let id = interaction.fields.getTextInputValue('cmd_rc_category_voice');
				client.channels.fetch(id)
					.then((channel) => {
						if (channel.type == "GUILD_VOICE") {
							client.db.set(`guilds.g${interaction.guild.id}.category.voice`, {
								id: channel.id,
								name: channel.name
							});
							let reply = this.getReply(2, lang);
							reply.components[0].components[3].setStyle('SECONDARY');
							reply.components[0].components[1].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.folder.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
							reply.components[0].components[2].setStyle(client.db.get(`guilds.g${interaction.guild.id}.category.text.id`) != undefined ? 'SECONDARY' : 'PRIMARY');
							interaction.update(reply);
						} else {
							interaction.reply({
								content: Config.strings.category_error[lang],
								ephemeral: true
							});
						}
					})
					.catch(() => {
						interaction.reply({
							content: Config.strings.category_error[lang],
							ephemeral: true
						});
					});
				return true;
			}
			if (interaction.customId == "cmd_rc_name") {
				const 	name = interaction.fields.getTextInputValue('cmd_rc_name'),
						channels = client.db.get(`guilds.g${interaction.guild.id}.channels`);				
				for(let i = 0; i < channels.length; i++) {
					if (channels[i].voice == interaction.member?.voice?.channel?.id && channels[i].owner == interaction.user.id) {
						interaction.member.voice.channel.setName(name);
						interaction.reply({
							content: Config.strings.success_channel_name[lang],
							ephemeral: true
						});
						return true;
					}
				}
				interaction.reply({
					content: Config.strings.error_channel_name[lang],
					ephemeral: true
				});
				return true;
			}
			if (interaction.customId == "cmd_rc_limit") {
				const 	limit = interaction.fields.getTextInputValue('cmd_rc_limit'),
						channels = client.db.get(`guilds.g${interaction.guild.id}.channels`);				
				for(let i = 0; i < channels.length; i++) {
					if (channels[i].voice == interaction.member?.voice?.channel?.id && channels[i].owner == interaction.user.id) {
						let arr = /\d/g.exec(limit);
						interaction.member.voice.channel.setUserLimit(parseInt(arr[0]));
						interaction.reply({
							content: Config.strings.success_channel_limit[lang],
							ephemeral: true
						});
						return true;
					}
				}
				interaction.reply({
					content: Config.strings.error_channel_limit[lang],
					ephemeral: true
				});
				return true;
			}
		}
		return false;
    }
}

module.exports = RoomCreator