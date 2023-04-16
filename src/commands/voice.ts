import { partyChannelLocks, partyChannelOwners } from "../events/discord/voiceStateUpdate";
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
			{
				name: "claim",
				description: "Claims ownership over a party voice channel if the owner has left",
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: "hijack",
				description: "Hijacks a party voice channel (staff only)",
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: "lock",
				description: "Locks a party voice channel",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "shouldlock",
						description: "Whether to lock the channel or not",
						type: ApplicationCommandOptionType.Boolean,
						required: true,
					},
				],
			},
		],
	},
	run: async (_, interaction) => {
		const wtfembed = [
			{
				title: "Error",
				description: "Something went wrong, please try again later",
				color: 0xff0000,
			},
		];

		if (!interaction.guild || !interaction.member || !("voice" in interaction.member)) {
			await interaction.reply({
				embeds: wtfembed,
			});
			return;
		}

		const createChannel = (await interaction.guild.channels
			.fetch(process.env.PARTY_CHANNEL_ID)
			.catch(null)) as BaseGuildVoiceChannel | null;

		if (!createChannel) {
			await interaction.reply({
				embeds: wtfembed,
			});
			return;
		}

		const partyCategory = createChannel.parent;

		if (!partyCategory) {
			await interaction.reply({
				embeds: wtfembed,
			});
			return;
		}

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

		const subcommand = interaction.options.getSubcommand(true);

		const isOwner = partyChannelOwners.get(voiceChannel.id) !== interaction.member.id;

		switch (subcommand) {
			case "name": {
				if (isOwner) {
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
			case "claim": {
				const owner = partyChannelOwners.get(voiceChannel.id);

				if (owner === interaction.member.id) {
					await interaction.reply({
						embeds: [
							{
								title: "Error",
								description: "You are already the owner of this party voice channel",
								color: 0xff0000,
							},
						],
					});
					return;
				}

				if (owner && voiceChannel.members.has(owner)) {
					await interaction.reply({
						embeds: [
							{
								title: "Error",
								description: "The owner of this party voice channel is still in the channel",
								color: 0xff0000,
							},
						],
					});
					return;
				}

				partyChannelOwners.set(voiceChannel.id, interaction.member.id);

				await interaction.reply({
					embeds: [
						{
							title: "Claimed the channel",
							description: "You are now the owner of this party voice channel",
							color: 0x00ff00,
						},
					],
				});

				break;
			}
			case "hijack": {
				// this is subject to change
				const allowedRoles = [
					"569670238644338709", // billy's role
					"778750457291997204", // admin role
					"569670445012353035", // community manager role
					"598146311514226698", // dev role (here for testing but will be removed later)
				];

				const roles = interaction.member.roles.cache.map((role) => role.id);

				if (!roles.some((role) => allowedRoles.includes(role))) {
					await interaction.reply({
						embeds: [
							{
								title: "Not for you :)",
								description: "This is staff only",
								color: 0xff0000,
							},
						],
					});
					return;
				}

				partyChannelOwners.set(voiceChannel.id, interaction.member.id);

				await interaction.reply({
					embeds: [
						{
							title: "Took over the channel",
							description: "You are now the owner of this party voice channel",
							color: 0x00ff00,
						},
					],
				});

				break;
			}
			case "lock": {
				if (isOwner) {
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

				const locked = partyChannelLocks.get(voiceChannel.id)!;

				const shouldLock = interaction.options.getBoolean("shouldLock", true);

				if (locked === shouldLock) {
					await interaction.reply({
						embeds: [
							{
								title: "Error",
								description: `This party voice channel is already ${locked ? "locked" : "unlocked"}`,
								color: 0xff0000,
							},
						],
					});
					return;
				}

				partyChannelLocks.set(voiceChannel.id, shouldLock);

				voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
					Connect: !shouldLock,
				});

				await interaction.reply({
					embeds: [
						{
							title: `${shouldLock ? "Locked" : "Unlocked"} the channel`,
							description: `You ${shouldLock ? "locked" : "unlocked"} this party voice channel`,
							color: 0x00ff00,
						},
					],
				});

				break;
			}
			default: {
				await interaction.reply({
					embeds: wtfembed,
				});
				return;
			}
		}
	},
	staffOnly: false,
};

export default command;
