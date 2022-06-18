import { TextChannel } from "discord.js";
import bot from "..";

export default async (err: Error, message?: string) => {
	bot.logger.error(message ? message + err : err);

	if (bot.discord.isReady()) {
		((await bot.discord.channels.fetch(process.env.ERROR_CHANNEL_ID as string)) as TextChannel).send(
			err.name + " " + err.message + "\n" + (err.stack ?? ""),
		);
	}
};
