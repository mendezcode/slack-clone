/* utils.js */

import { timestamp } from './functions.js';

/**
 * The canonical URL of the application.
 */
const BASE_URI = document.head.querySelector( 'link[rel=canonical]' ).href;

/**
 * Returns the base url for the site.
 *
 * @param path string the path to return the complete site URI for
 * @return string
 */
export function getBaseUrl( path ) {
	return `${ BASE_URI.replace( /\/$/, '' ) }/${ path.replace( /^\//, '' ) }`;
}

/**
 * Returns the Avatar URL for a given user slug.
 *
 * @param slug String The user slug
 * @return String
 */
export function getUserAvatarUrl( slug ) {
	return getBaseUrl( `/images/users/${ slug }.jpg` );
}

/**
 * Checks if a given target is a channel.
 *
 * @param target String The target
 * @return Boolean
 */
export function isChannelPrefix( target ) {
	return target.slice( 0, 1 ) === '#';
}

/**
 * Checks if a given target is a user.
 *
 * @param target String The target
 * @return Soolean
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
