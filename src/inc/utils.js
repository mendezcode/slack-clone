/* utils.js */

import { timestamp } from './functions.js';

/**
 * Returns the Avatar URL for a given user slug.
 *
 * @param slug String The user slug
 * @return string
 */
export function getUserAvatarUrl( slug ) {
	return `/images/users/${ slug }.jpg`;
}

/**
 * Checks if a given target is a channel.
 *
 * @param target String The target
 * @return boolean
 */
export function isChannelPrefix( target ) {
	return target.slice( 0, 1 ) === '#';
}

/**
 * Checks if a given target is a user.
 *
 * @param target String The target
 * @return boolean
 */
export function isUserPrefix( target ) {
	return target.slice( 0, 1 ) === '@';
}

/**
 * Creates a message object.
 *
 * @param user String the user sending the message
 * @param message String The message text
 * @return Object
 */
export function createMessageObject( user, message ) {
	return {
		text: message,
		from: user,
		timestamp: timestamp(),
	}
}
