/* session.js */

import { getUserSlugs, getSiteMeta } from './data.js';
import { random } from './functions.js';

let SESSION = null;

/**
 * Returns the current user session (simulated).
 */
export async function getCurrentSession() {
	if ( ! SESSION ) {
		const { defaultChannel } = await getSiteMeta();
		const users = await getUserSlugs();
		SESSION = {
			user: random( users ),
			currentChannel: defaultChannel,
		}
	}
	return SESSION;
}
