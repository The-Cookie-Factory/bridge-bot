const index = require("../../../index.js");
const bot = index.bot;
const sendToDiscord = index.sendToDiscord;
const checkIfUserBlacklisted = require("../../../utilities/checkIfUserBlacklisted.js");

module.exports = {
  name: "guild_join",
  async execute(Rank_guild_join, username_guild_join) {
    sendToDiscord(
      `-----------------------------------------------------\n**${Rank_guild_join} ${username_guild_join}** joined the guild!\n-----------------------------------------------------`
    );
    // logger.info(`-----------------------------------------------------\n**${Rank_guild_join} ${username_guild_join}** joined the guild!\n-----------------------------------------------------`)

    if (await checkIfUserBlacklisted(username_guild_join)) {
      bot.chat(
        `/g kick ${username_guild_join} You have been blacklisted from the guild, Mistake? --> (discord.gg/dEsfnJkQcq)`
      );
      console.log(
        "Kicking " + username_guild_join + " because they are blacklisted"
      );
    } else {
      const welcomeMessages = [
        `Welcome to the #19 guild on Hypixel, Miscellaneous! Join the discord | discord.gg/misc`,
        `Welcome to the guild! Make sure to join the discord at discord.gg/misc`,
        `Welcome to the guild, ${username_guild_join}! Join the discord at discord.gg/misc`,
        `Welcome to the guild, ${username_guild_join}! Interact with the community more at discord.gg/misc`,
      ];

      if (!Rank_guild_join) {
        Rank_guild_join = "";
      }

      setTimeout(() => {
        bot.chat(
          welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
        );
      }, 3000);
    }
  },
};
