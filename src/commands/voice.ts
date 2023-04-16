import { partyChannelOwners } from "../events/discord/voiceStateUpdate";
import { Command } from "../interfaces/Command";
import { ApplicationCommandOptionType, BaseGuildVoiceChannel } from "discord.js";

const command: Command = {
	data: {
		name: "voice",
		description: "Edit your party voice channel",
		options: [
			{
				name: "name",
				description: "Change the name of your party voice channel",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "name",
						description: "The new name of your party voice channel",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		],
	},
	run: async (_, interaction) => {
		if (!interaction.guild || !interaction.member || !("voice" in interaction.member)) {
			await interaction.reply({
				embeds: [
					{
						title: "Error",
						description: "Something went wrong, please try again later",
						color: 0xff0000,
					},
				],
			});
			return;
		}

		const createChannel = (await interaction.guild.channels
			.fetch(process.env.PARTY_CHANNEL_ID)
			.catch(null)) as BaseGuildVoiceChannel | null;

		if (!createChannel) return;

		const partyCategory = createChannel.parent;

		if (!partyCategory) return;

		const voiceChannel = interaction.member.voice.channel as BaseGuildVoiceChannel | null;

		if (!voiceChannel) {
			await interaction.reply({
				embeds: [
					{
						title: "Error",
						description: "You are not in a voice channel",
						color: 0xff0000,
					},
				],
			});
			return;
		}

		if (voiceChannel.parent?.id !== partyCategory.id || voiceChannel.id === process.env.PARTY_CHANNEL_ID) {
			await interaction.reply({
				embeds: [
					{
						title: "Error",
						description: "You are not in a party voice channel",
						color: 0xff0000,
					},
				],
			});
			return;
		}

		if (partyChannelOwners.get(voiceChannel.id) !== interaction.member.id) {
			await interaction.reply({
				embeds: [
					{
						title: "Error",
						description: "You are not the owner of this party voice channel",
						color: 0xff0000,
					},
				],
			});
			return;
		}

		const subcommand = interaction.options.getSubcommand(true);

		switch (subcommand) {
			case "name": {
				const name = interaction.options.getString("name", true);

				if (name.length > 24) {
					await interaction.reply({
						embeds: [
							{
								title: "Error",
								description: "The name of your party voice channel can't be longer than 24 characters",
								color: 0xff0000,
							},
						],
					});
					return;
				}

				await voiceChannel.setName(name);

				await interaction.reply({
					embeds: [
						{
							title: "Changed the name",
							description: `Changed the name of your party voice channel to \`${name}\``,
							color: 0x00ff00,
						},
					],
				});

				break;
			}
			default: {
				await interaction.reply({
					embeds: [
						{
							title: "Error",
							description: "Something went wrong, please try again later",
							color: 0xff0000,
						},
					],
				});
				return;
			}
		}
	},
	staffOnly: false,
};

export default command;
