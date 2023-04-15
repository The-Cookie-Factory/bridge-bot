import { Event } from "../../interfaces/Event";
import { BaseGuildVoiceChannel, ChannelType, VoiceChannel, VoiceState } from "discord.js";

export default {
	name: "voiceStateUpdate",
	runOnce: true,
	run: async (_, oldState: VoiceState, newState: VoiceState) => {
		console.log(!!newState.member, !!oldState.member);
		if (!oldState.member || !newState.member) return;

		const createChannel = (await newState.guild.channels
			.fetch(process.env.PARTY_CHANNEL_ID)
			.catch(null)) as BaseGuildVoiceChannel;

		if (!createChannel) return;

		const partyCategory = createChannel.parent;

		if (!partyCategory) return;

		if (!newState.channel) {
			const leaveChannel = oldState.channel;

			console.log(leaveChannel === undefined);

			if (!leaveChannel) return;

			console.log(leaveChannel.parent?.id, partyCategory.id);

			if (leaveChannel.parent?.id !== partyCategory.id) return;

			if (leaveChannel.id !== process.env.PARTY_CHANNEL_ID) {
				// they left one of the party channels
				if (leaveChannel.members.size === 0) {
					leaveChannel.delete();
				}
			}
		} else {
			const joinChannel = newState.channel;

			if (joinChannel.parent?.id !== partyCategory.id) return;

			if (joinChannel.id === process.env.PARTY_CHANNEL_ID && newState.channel.parent) {
				// they joined the create channel
				const newPartyChannel = (await newState.guild.channels
					.create({
						type: ChannelType.GuildVoice,
						name: `${newState.member.displayName}'s party`,
						parent: newState.channel.parent,
					})
					.catch(() => null)) as VoiceChannel | null;

				if (!newPartyChannel) {
					console.log("Bot does not have permission to create channels");
					return;
				}

				newState.setChannel(newPartyChannel);
			}
		}
	},
} as Event;
