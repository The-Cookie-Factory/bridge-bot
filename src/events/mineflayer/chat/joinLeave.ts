import { Event } from "../../../interfaces/Event";

export default {
	name: "chat:joinLeave",
	runOnce: false,
	run: async (_, playerName: string, status: "joined" | "left") => {
		console.log(playerName + " " + status);
	},
} as Event;
