const { Collection } = require('discord.js');
const cooldown = new Collection();
const moment = require('moment');
const { owner } = require('../setting/setting.json');
module.exports = {
	name: 'interactionCreate',
	/**
     * @param {import('discord.js').Interaction} interaction - Interaction commands
	 * @param {Collection<string, object>} appcommands
     */
	async run(interaction, appcommands) {

		const time = moment().format('YYYY MM DD HH:mm:ss');

		if (interaction.isCommand()) {
			const commandName = interaction.commandName;
			const appCommand = appcommands.get(commandName);
			if (!interaction.member) {
				return interaction.reply({ content: 'Nope! can\'t do that in DM', ephemeral: true });
			}

			if(appCommand.owner && interaction.user.id !== owner) {
				return interaction.reply({ content:'Nope! Only owner command', ephemeral: true });
			}
			// Check if there is any cooldown and set the cooldown if none exist
			{
				if (!cooldown.has(appCommand.name)) {
					cooldown.set(appCommand.name, new Collection());
				}
			}

			const now = Date.now();
			const timestamps = cooldown.get(appCommand.name);
			const cooldownAmount = (appCommand?.cooldown || 3) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					return interaction.reply({
						content:`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
							appCommand.name
						}\` command.`,
						ephemeral: true },
					);
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			try {
				appCommand.slashcommand(interaction, appcommands);
			}
			catch (err) {
				console.error(`${time} [CommandInteraction] ${err}`);
			}
		}

		if (interaction.isContextMenu()) {
			try {
				const commandName = interaction.commandName;
				const contextMenu = appcommands.get(commandName);
				contextMenu.contextmenu(interaction, appcommands);
			}
			catch (error) {
				console.warn(`${time} [contextmenu] ${error}`);
			}
		}

		if (interaction.isButton()) {
			try {
				const CustomId = interaction.customId;
				const slashCommand = appcommands.get(CustomId.split('_')[0]);
				slashCommand.button(interaction, appcommands);
			}
			catch (err) {
				console.warn(`${time} [Button] ${err}`);
			}
		}

		if (interaction.isSelectMenu()) {
			try {
				const CustomId = interaction.customId;
				const slashCommand = appcommands.get(CustomId.split('_')[0]);
				slashCommand.selectmenu(interaction, appcommands);
			}
			catch (err) {
				console.warn(`${time} [SelectMenu] ${err}`);
			}
		}
	},
};
