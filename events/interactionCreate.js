const { Collection } = require('discord.js');
const cooldown = new Collection();
const moment = require('dayjs');
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
			try {
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
				console.log(`[contextmenu] ${commandName} have been used! at ${time}`);
			}
			catch (error) {
				console.warn(`${time} [ContextMenu] ${error}`);
			}
		}

		if (interaction.isButton()) {
			try {
				const customId = interaction.customId;
				const slashCommand = appcommands.get(customId.split('_')[0]);
				slashCommand.button(interaction, appcommands);
				console.log(`[Button] ${customId} have been used! at ${time}`);
			}
			catch (err) {
				console.warn(`${time} [Button] ${err}`);
			}
		}

		if (interaction.isSelectMenu()) {
			try {
				const customId = interaction.customId;
				const slashCommand = appcommands.get(customId.split('_')[0]);
				slashCommand.selectmenu(interaction, appcommands);
				console.log(`[SelectMenu] ${customId} have been used! at ${time}`);
			}
			catch (err) {
				console.warn(`${time} [SelectMenu] ${err}`);
			}
		}
	},
};
