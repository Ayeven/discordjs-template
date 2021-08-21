const { MessageButton, version, Constants } = require('discord.js');
const opt = Constants.ApplicationCommandOptionTypes;
const moment = require('moment');
require('moment-duration-format');
module.exports = {
	name: 'misc',
	description: 'Misc functions for the bot',
	options:[
		{
			type:opt.SUB_COMMAND,
			name: 'ping',
			description: 'It give you pong!',
		},
		{
			type:opt.SUB_COMMAND,
			name: 'invite',
			description: 'Show you how to invite the bot into your server!',
		},
		{
			type:opt.SUB_COMMAND,
			name: 'stats',
			description: 'Show you the statistic of the bot',
		},
	],
	/**
   * @param {import('discord.js').CommandInteraction} interaction
   */
	async slashcommand(interaction) {
		try{
			await interaction.deferReply({ ephemeral:true });
			let linkspeak;
			let linkslash;
			let speak = '';
			let slashonly = '';
			const duration = moment.duration(interaction.client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
			switch(interaction.options.getSubcommand()) {
			case 'ping' :
				interaction.editReply(`❤ Pong!Ping is ${interaction.client.ws.ping}`);
				break;
			case 'invite' :
				speak = interaction.client.generateInvite({ scopes:['applications.commands', 'bot'], permissions:['CONNECT', 'SPEAK'] });
				slashonly = interaction.client.generateInvite({ scopes: ['applications.commands', 'bot'] });
				linkspeak = new MessageButton({
					style: 'LINK',
					url: speak,
					label: '/ command with voice',
				});
				linkslash = new MessageButton({
					style: 'LINK',
					url: slashonly,
					label: '/ command only',
				});
				interaction.editReply({ content: 'Here is my invite link with slash command enabled', components:[{ type: 'ACTION_ROW', components:[linkspeak, linkslash] }] });
				break;
			case 'stats':
				interaction.editReply({ content:
                    `\`\`\`asciidoc
                    = STATISTICS =
                • Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
                • Uptime     :: ${duration}
                • Discord.js :: v${version}
                • Node       :: ${process.version}
                • User       :: ${interaction.client.users.cache.size.toLocaleString()}
                • Channels   :: ${interaction.client.channels.cache.size.toLocaleString()}
                • Guilds     :: ${interaction.client.guilds.cache.size.toLocaleString()}
                • Platform   :: ${process.platform} ${process.arch}\`\`\`` });
				break;
			}
		}
		catch (err) {console.error(err);}
	},
};