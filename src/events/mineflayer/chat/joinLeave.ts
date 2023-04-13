import Emojis from "../../../util/emojis/chatEmojis";
import { Event } from "../../../interfaces/Event";
import { escapeMarkdown } from "discord.js";

export default {
	name: "chat:joinLeave",
	runOnce: false,
	run: async (bot, playerName: string, status: "joined" | "left") => {
		console.log(playerName + " " + status);
	}
} as Event;
