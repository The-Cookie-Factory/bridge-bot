import { Event } from "../../interfaces/Event";
import { MessageEmbed } from "discord.js";

export default {
	name: "chat:sameMessageTwice",
	runOnce: false,
	run: async (bot) => {
		const embed = new MessageEmbed().setDescription("`You cannot say the same message twice!`").setColor("#36393F");

		return await bot.sendEmbed("gc", [embed]);
	},
} as Event;
