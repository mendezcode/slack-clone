/* slack-clone.js */

import lodash from 'lodash';

import React, {
	useState,
	useEffect,
	useLayoutEffect,
	useReducer,
	useContext,
} from 'react';

import {
	getUserMeta,
	getChannels,
	getChannelMeta,
	getUsers,
	getChannelMessages,
	getUserMessages,
} from './inc/data.js';

import { noop } from './inc/functions.js';

import { isChannelPrefix, isUserPrefix } from './inc/utils.js';

import { sendMessage, sendBotMessage, initRandomMessages } from './inc/chat.js';

import { bots } from './inc/bots.js';

import './slack-clone.scss';

const LastUpdatedContext = React.createContext( noop );

function SlackClone( { title, user, channel: currentChannel, preload: PRELOAD } ) {
	// Determines the current channel context.
	// When this is changed, the channel view changes.
	const [ channel, setChannel ] = useState( currentChannel );

	// State variable that triggers loading of new messages
	// whenever a new message is added from the chat box.
	const [ lastUpdated, setLastUpdated ] = useReducer( ( state ) => {
		return Date.now();
	}, Date.now() );

	// Updates the channel's unread messages status.
	const [ updates, setChannelUpdate ] = useReducer( ( state, [ chan, updated ] ) => {
		if ( chan === channel ) {
			setLastUpdated(); // Auto update message list on channel update.
			updated = false; 	// Don't mark current channel as unread.
		}
		return {
			...state,
			[chan]: updated,
		}
	}, {} );

	// Add loops to constantly add messages to channels.
	useEffect( () => {
		if ( PRELOAD ) {
			initRandomMessages( user, setChannelUpdate ).then( noop );
		}
	}, [ PRELOAD, user ] );

	// Upon switching channel, mark all messages as read.
	useEffect( () => {
		setChannelUpdate( [ channel, false ] );
	}, [ channel ]);

	// Render.
	return (
		<LastUpdatedContext.Provider value={ setLastUpdated }>
			<Window title={ title } user={ user }>
				<Sidebar>
					<MainChannels
						channel={ channel }
						updates={ updates }
						setChannel={ setChannel }
						setChannelUpdate={ setChannelUpdate }
					/>
					<PeopleChannels
						channel={ channel }
						updates={ updates }
						setChannel={ setChannel }
						setChannelUpdate={ setChannelUpdate }
					/>
				</Sidebar>
				<MainView>
					<ChatHeader channel={ channel } />
					<ChatView
						user={ user }
						channel={ channel }
						setChannel={ setChannel }
						lastUpdated={ lastUpdated }
					/>
					<ChatBox user={ user } channel={ channel } />
				</MainView>
			</Window>
		</LastUpdatedContext.Provider>
	)
}

/**
 * Main window.
 */
function Window( { user: slug, title, children } ) {
	const [ user, setUserData ] = useState( null );
	useEffect( () => {
		getUserMeta( slug ).then( setUserData );
	}, [ slug ] );
	return (
		<div className="sc-window">
			<div className="sc-header">
				<h1 className="app-title">{ title }</h1>
				{ user && (
					<aside className="user-meta">
						<img src={ user.avatar } alt={ `User avatar for ${ user.name }` } />
						<span>{ user.name }</span>
					</aside>
				) }
			</div>
			<div className="sc-container">
				{ children }
			</div>
		</div>
	)
}

/**
 * App sidebar.
 */
function Sidebar( { children } ) {
	return (
		<div className="sc-sidebar">
			{ children }
		</div>
	)
}

/**
 * Main chat view.
 */
function MainView( { children } ) {
	return (
		<div className="sc-main-view">
			{ children }
		</div>
	)
}

/**
 * Chat header.
 */
function ChatHeader( { channel } ) {
	const [ title, setTitle ] = useState( '' );
	const [ prefix, setPrefix ] = useState( null );
	const context = channel.slice( 1 );
	useEffect( () => {
		if ( isChannelPrefix( channel ) ) {
			getChannelMeta( context ).then( ( meta ) => {
				setPrefix( '#' );
				setTitle( meta.title );
			} );
		} else {
			getUserMeta( context ).then( ( user ) => {
				setPrefix( null );
				setTitle( user.name );
			} );
		}
	}, [ context, channel ] );
	return (
		<div className="sc-chat-header">
			<h3>{ prefix && <span>{ prefix }</span> }{ title }</h3>
		</div>
	);
}

/**
 * Chat view.
 */
function ChatView( { user, channel: target, lastUpdated, setChannel } ) {
	const [ messages, setMessages ] = useState( [] );
	const ref = React.createRef();
	const isChannel = isChannelPrefix( target );
	const channel = target.slice( 1 );
	useEffect( () => {
		if ( isChannel ) {
			getChannelMessages( channel ).then( setMessages );
		} else {
			getUserMessages( user, channel ).then( setMessages );
		}
	}, [ user, channel, isChannel, lastUpdated ] );
	useLayoutEffect( () => {
		ref.current.scrollTop = 1e6
	} );
	return (
		<ul className="sc-chat-view" ref={ ref }>
			{ messages.map( ( message, i ) => {
				return (
					<ChatMessage key={ `message-${ i }` } message={ message } setChannel={ setChannel } />
				)
			} ) }
		</ul>
	)
}

/**
 * Chat Message component.
 */
function ChatMessage( { message, setChannel } ) {
	const { from, text, timestamp } = message;
	const switchToUser = () => {
		setChannel( `@${ from.slug }` );
	}
	return (
		<li className="sc-chat-message">
			<span className="avatar">
				<img alt={ from.name } src={ from.avatar } onClick={ switchToUser } />
			</span>
			<div className="msg-body">
				<span className="msg-meta">
					<strong onClick={ switchToUser }>{ from.name }</strong>
					<time>{ timestamp.toGMTString() }</time>
				</span>
				<span className="msg-text">
					{ text }
				</span>
			</div>
		</li>
	)
}

/**
 * Channels list.
 */
function MainChannels( { channel, updates, setChannel } ) {
	const [ channels, loadChannels ] = useState( [] );
	useEffect( () => {
		getChannels().then( loadChannels );
	}, [ channel ]);
	return (
		<div className="sc-channel-list">
			<h2 className="channel-list-title">Channels</h2>
			<ul data-for="channels">
				{ channels && channels.map( chan => {
					const target = `#${ chan }`;
					const active = ( target === channel );
					let className = [ 'channel-list-item' ];
					if ( active ) {
						className.push( 'active' );
					} else if ( updates[ target ] ) {
						className.push( 'changed' );
					}
					return (
						<ChannelListItem key={ chan } className={ className.join( ' ' ) } target={ target } setChannel={ setChannel }>
							<span>#</span> { chan }
						</ChannelListItem>
					)
				} ) }
			</ul>
		</div>
	);
}

/**
 * Peoples list.
 */
function PeopleChannels( { channel, setChannel }) {
	const [ users, loadUsers ] = useState( [] );
	useEffect( () => {
		getUsers().then( loadUsers );
	}, [ channel ]);
	return (
		<div className="sc-channel-list">
			<h2 className="channel-list-title">People</h2>
			<ul data-for="channels">
				{ users && users.map( ( user ) => {
					const target = `@${ user.slug }`;
					const active = ( target === channel );
					const className = [ 'channel-list-item' ].concat( active ? 'active' : [] ).join( ' ');
					return (
						<ChannelListItem key={ user.slug } className={ className } target={ target } setChannel={ setChannel }>
							{ user.name }
						</ChannelListItem>
					);
				} ) }
			</ul>
		</div>
	);
}

/**
 * Item for each list.
 */
function ChannelListItem( { className, target, children, setChannel } ) {
	return (
		<li className={ className } data-target={ target } onClick={ () => setChannel( target ) }>{ children }</li>
	);
}

/**
 * Chat box.
 */
function ChatBox( { user, channel } ) {
	const setLastUpdated = useContext( LastUpdatedContext );
	const [ timeout, setNewTimeout ] = useState( 0 );
	const ref = React.createRef();

	// Hold state to remember last things typed for each channel.
	const [ state, dispatch ] = useReducer( ( state, action ) => {
		const [ channel, text ] = action;
		state[ channel ] = text;
		return state;
	}, {} );

	// Handle ENTER key press.
	const onKeyUp = ( e ) => {
		if ( 13 === e.keyCode ) {
			const message = ( e.target.value ?? '' ).trim();
			if ( message ) {
				sendMessage( user, channel, message ).then( noop );
				e.target.value = '';
				dispatch( [ channel, '' ] );

				// If it's a bot, send bot reply.
				// Make sure not to send bot messages to self.
				if ( isUserPrefix( channel ) && channel !== `@${ user }`) {
					clearTimeout( timeout );
					setNewTimeout( setTimeout( () => {
						const reply = bots.chat( channel, message );
						sendBotMessage( user, channel, reply ).then( noop );
						setLastUpdated();
					}, lodash.random( 1000, 1500 ) ) );
				}

				setLastUpdated();
				ref.current.focus();

			}
		}
	}

	// Whenever the input changes, remember what we typed.
	const onChange = ( e ) => {
		dispatch( [ channel, e.target.value ] );
	}

	// Focus the input on load.
	useEffect( () => {
		ref.current.focus();
	} );

	// Update the chat box with last thing typed for channel.
	useEffect( () => {
		ref.current.value = state[channel] || '';
	}, [ ref, state, channel ] );

	// Render.
	return (
		<div className="sc-chat-box">
			<input
				tabIndex={ 0 }
				type="text"
				ref={ ref }
				placeholder={ 'Type your message here. Press Enter to send.' }
				onKeyUp={ onKeyUp }
				onChange={ onChange }
			/>
		</div>
	)
}

export default SlackClone;
