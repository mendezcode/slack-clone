/* chat.js */

import lodash from 'lodash';

import { random, timestamp } from './functions.js';
import { getChannels, getUserSlugs, insertChannelMessage, insertDirectMessage } from './data.js';
import { createMessageObject, isChannelPrefix } from './utils.js';
import { getQuotes } from './quotes.js';

/**
 * Sends a message to a given user or channel.
 */
export async function sendMessage( user, target, message ) {
	const channel = target.slice( 1 );
	message = createMessageObject( user, message );
	if ( isChannelPrefix( target ) ) {
		await sendChannelMessage( channel, message );
	} else {
		await sendDirectMessage( user, channel, message );
	}
}

/**
 * Sends a message coming from a bot.
 */
export async function sendBotMessage( user, bot, msg ) {
	const botname = bot.slice( 1 );
	const message = createMessageObject( botname, msg );
	await insertDirectMessage( user, botname, message );
}

/**
 * Sends a message to a channel.
 */
export async function sendChannelMessage( channel, message ) {
	await insertChannelMessage( channel, message );
}

/**
 * Sends a direct message to a user.
 */
export async function sendDirectMessage( user, channel, message ) {
	await insertDirectMessage( user, channel, message );
}

/**
 * Gets randomly generated messages using quotes.
 */
export async function getRandomMessages( users, count ) {
	let timeOffset = 0;
	const timeStart = new Date( Date.now() - lodash.random(5, 12) * 3600 * 1000 );
	const messages = await getQuotes( count );
	return messages.map( message => {
		timeOffset += lodash.random( 1*1000, 10*60*1000 );
		return {
			from: random( users ),
			text: message,
			timestamp: timestamp( timeStart.valueOf() + timeOffset ),
		}
	} );
}

/**
 * Initialize the random messages to populate channels with.
 */
export async function initRandomMessages( currentUser, setChannelUpdate ) {
	const channels = await getChannels();
	let users = await getUserSlugs();
	users = users.filter( user => user !== currentUser );
	const messages = await getRandomMessages( users, channels.length );
	messages.forEach( message => {
		setTimeout( async () => {
			const channel = random( channels );
			message.timestamp = timestamp();
			await sendChannelMessage( channel, message );
			setChannelUpdate( [ `#${ channel }`, true ] );
		}, lodash.random( 1, 6 ) * 1000 );
	} );
}

/**
 * Loads the initial channel messages.
 */
export async function loadMessages() {
	const channels = await getChannels();
	const users = await getUserSlugs();
	channels.forEach( async ( channel ) => {
		const count = lodash.random( 2, 7 );
		const messages = await getRandomMessages( users, count );
		messages.map( async ( message ) => {
			await sendChannelMessage( channel, message );
		} );
	} );
}
