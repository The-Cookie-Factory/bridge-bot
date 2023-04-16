import { Event } from "../../interfaces/Event";
import { BaseGuildVoiceChannel, ChannelType, TextChannel } from "discord.js";

export default {
	name: "ready",
	runOnce: true,
	run: async (bot) => {
		bot.discord.application?.commands.set(bot.discord.commands.map((command) => command.data));

		bot.memberChannel = (await bot.discord.channels.fetch(process.env.MEMBER_CHANNEL_ID)) as TextChannel;
		bot.officerChannel = (await bot.discord.channels.fetch(process.env.OFFICER_CHANNEL_ID)) as TextChannel;

		bot.setStatus();

		const partyCreateChannel = (await bot.discord.channels
			.fetch(process.env.PARTY_CHANNEL_ID)
			.catch(null)) as BaseGuildVoiceChannel | null;

		if (partyCreateChannel && partyCreateChannel.parent) {
			// fetch all
			const empty = Array.from(partyCreateChannel.parent.children.cache.values())
				.filter((c) => c.id !== partyCreateChannel.id)
				.filter((c) => c.type === ChannelType.GuildVoice)
				.filter((c) => c.members.size === 0);

			for (const channel of empty) {
				await channel.delete().catch(null);
			}
		}
	},
} as Event;
