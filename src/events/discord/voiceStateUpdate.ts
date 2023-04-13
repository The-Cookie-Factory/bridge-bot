import { Event } from "../../interfaces/Event";
import { BaseGuildVoiceChannel, ChannelType, GuildMember, VoiceChannel } from "discord.js";

export default {
	name: "voiceStateUpdate",
	runOnce: true,
	run: async (_, oldMem: GuildMember, newMem: GuildMember) => {
		const createChannel = (await newMem.guild.channels
			.fetch(process.env.PARTY_CHANNEL_ID)
			.catch(null)) as BaseGuildVoiceChannel;

		if (!createChannel) return;

		const partyCategory = createChannel.parent;

		if (!partyCategory) return;

		if (newMem.voice === undefined || oldMem.voice === undefined) return; // temporary

		if (!newMem.voice.channel) {
			const leaveChannel = oldMem.voice.channel;

			if (!leaveChannel) return;

			if (leaveChannel.parent?.id !== partyCategory.id) return;

			if (leaveChannel.id !== process.env.PARTY_CHANNEL_ID) {
				// they left one of the party channels
				if (leaveChannel.members.size === 0) {
					leaveChannel.delete();
				}
			}
		} else {
			const joinChannel = newMem.voice.channel;

			if (joinChannel.parent?.id !== partyCategory.id) return;

			if (joinChannel.id === process.env.PARTY_CHANNEL_ID) {
				// they joined the create channel
				const newPartyChannel = (await newMem.guild.channels.create({
					type: ChannelType.GuildVoice,
					name: `${newMem.user.username}'s party`,
				})) as VoiceChannel;

				newMem.voice.setChannel(newPartyChannel);
			}
		}
	},
} as Event;
