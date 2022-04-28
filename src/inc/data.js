/* data.js */

import lodash from 'lodash';

import { getUserAvatarUrl } from './utils.js';

const DATABASE = {
	meta: {
		title: 'Slack Clone',
		defaultChannel: '#general',
	},
	channels: {
		'general':    { meta: { title: "General Discussion" },   messages: [] },
		'help':       { meta: { title: "Help Topics" },          messages: [] },
		'technology': { meta: { title: "Technology & Gadgets" }, messages: [] },
		'life':       { meta: { title: "Life" },                 messages: [] },
		'philosophy': { meta: { title: "Philosophy" },           messages: [] },
		'computing':  { meta: { title: "Computer Science" },     messages: [] },
	},
	users: {
		'dgale005':      { meta: { name: 'Dave Gale' },     messages: {} },
		'ssamuels':      { meta: { name: 'Sarah Samuels' }, messages: {} },
		'zpitts_42':     { meta: { name: 'Zack Pitts' },    messages: {} },
		'pamgarz':       { meta: { name: 'Pam García' },    messages: {} },
		'erinho':        { meta: { name: 'Erin Ho' },       messages: {} },
		'joecampbell02': { meta: { name: 'Joe Campbell' },  messages: {} },
	},
}

const db = {

	/**
	 * Performs a database query.
	 */
	async query( attr, defval=null ) {
		return lodash.get( DATABASE, attr, defval );
	}

}

/**
 * Inserts a message into a channel.
 */
export async function insertChannelMessage( channel, message ) {
	DATABASE.channels[ channel ].messages.push( message );
}

/**
 * Inserts a message into a user's direct message channels.
 */
export async function insertDirectMessage( user, channel, message ) {
	const target = DATABASE.users[ user ].messages;
	if ( ! target[channel] ) {
		target[channel] = [];
	}
	target[ channel ].push( message );
}

/**
 * Returns the list of all the available channels.
 */
export async function getChannels() {
	const channels = await db.query( 'channels' );
	return Object.keys( channels );
}

/**
 * Returns the list of all the messages on a given channel.
 */
export async function getChannelMessages( channel ) {
	let messages = await db.query( `channels.${ channel }.messages`, [] );
	messages = messages.map( async ( message ) => {
		return await messageFormat( message );
	} );
	return Promise.all( messages );
}

/**
 * Returns the metadata for a given channel.
 */
export async function getChannelMeta( channel ) {
	const meta = await db.query( `channels.${ channel }.meta`, null );
	if ( meta ) {
		return {
			...meta,
			slug: channel
		}
	}
	return null;
}

/**
 * Returns the site's metadata.
 */
export async function getSiteMeta() {
	return await db.query( 'meta' );
}

/**
 * Returns the avaialble users.
 */
export async function getUsers() {
	const users = await db.query( 'users' );
	return Object.keys( users ).map( ( user ) => {
		return userFormat( user, users[user].meta );
	} );
}

/**
 * Returns the slugs for the available users.
 */
export async function getUserSlugs() {
	const users = await getUsers();
	return users.map( user => user.slug );
}

/**
 * Returns the user meta information.
 */
export async function getUserMeta( slug ) {
	const user = await db.query( `users.${ slug }` );
	if ( user ) {
		return userFormat( slug, user.meta );
	}
	return null;
}

/**
 * Returns the given user direct messages from a given sender.
 */
export async function getUserMessages( user, from ) {
	let messages = await db.query( `users.${ user }.messages.${ from }`, [] );
	messages = messages.map( async ( message ) => {
		return await messageFormat( message );
	} );
	return Promise.all( messages );
}

async function messageFormat( message ) {
	return {
		...message,
		from: await getUserMeta( message.from ),
		timestamp: new Date( message.timestamp ),
	}
}

function userFormat( slug, meta ) {
	return {
		...meta,
		avatar: getUserAvatarUrl( slug ),
		slug,
	}
}
