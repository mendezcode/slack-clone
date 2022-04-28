/* bots.js */

/**
 * Bots Artificial Intelligence class.
 * Coordinates multiple instances of ElizaBot.
 *
 * @see https://www.masswerk.at/elizabot/
 */
class BotsAI {

	memory = {};

  /**
   * Performs a context-sensitive chat with a bot.
   *
   * @param context String The chat context (user)
   * @param message Text The chat message
   * @return String
   */
	chat( context, message ) {
		const { memory } = this;
		if ( memory[ context ] ) {
			return memory[ context ].transform( message );
		} else {
			const bot = new window.ElizaBot( false );
			memory[ context ] = bot;
			return bot.getInitial();
		}
	}

}

export const bots = new BotsAI();
