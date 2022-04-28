import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import SlackClone from './slack-clone.js';

import { getCurrentSession } from './inc/session.js';
import { loadQuotes } from './inc/quotes.js';
import { loadMessages } from './inc/chat.js';
import { getSiteMeta } from './inc/data.js';

// Use the ?clean query string to load app without message preloading.
const PRELOAD_MESSAGES = ! /\?clean/.test( window.location.toString() );

/**
 * Main Application component.
 */
function App() {
	const [ title, setTitle ] = useState( '' );
	const [ session, setSession ] = useState( null );

	useEffect( () => {
		initialize().then( () => {
			getSiteMeta().then( ( { title } ) => setTitle( title ) );
			getCurrentSession().then( ( session ) => setSession( session ) );
		} );
	}, [] );

	useEffect( () => {
		if ( session && title ) {
			const { user } = session;
			document.title = user ? `${ title } (${ user })` : title;
		}
	}, [ session, title ] );

	if ( session ) {
		const { user, currentChannel } = session;
		return (
			<SlackClone title={ title } user={ user } channel={ currentChannel } preload={ PRELOAD_MESSAGES } />
		)
	}

	return null;
}

/**
 * Initializes the application.
 *
 * @return Promise<void>
 */
async function initialize() {
	await loadQuotes();
	if ( PRELOAD_MESSAGES ) {
		await loadMessages();
	}
}

const root = createRoot( document.querySelector( '#root' ) );

root.render( <App /> );
