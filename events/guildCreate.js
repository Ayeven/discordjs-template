module.exports = {
	name: 'guildCreate',
	/**
	 * @param {import("discord.js").Guild} guild
	 * @param {import("discord.js").Client} client
	 * @param {import('discord.js').Collection<string, object>} _appcommands
	 */
	async run(guild, _appcommands, client) {
		client.user.setActivity(`/help ${client.guilds.cache.size} server`, { type: 'PLAYING' });
		const ownner = await guild.members.fetch(guild.ownerId);
		console.log(
			`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot. Owner: ${ownner.user.tag} (${ownner.user.id})`,
		);
	},
};
