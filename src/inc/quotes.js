/* quotes.js */

import lodash from 'lodash';

import quotes from '../vendor/quotes/quotes.txt';

let QUOTES_DATA = null;

/**
 * Parses the quotes from the text file and loads them.
 */
export async function loadQuotes() {
	const res = await fetch( quotes );
	const buf = await res.text();
	QUOTES_DATA = buf.split( /\n{2}/ ).map( quote => {
		const q = quote.split( /\n/ );
		q.pop();
		return q.join( '\n' );
	} ).reduce( ( acc, quote ) => {
		acc.push( quote.trim() );
		return acc;
	}, [] );
}

/**
 * Gets a given number of quotes.
 */
export function getQuotes( count=1 ) {
	return lodash.shuffle( QUOTES_DATA ).slice( 0, count );
}

/**
 * Get a single quote.
 */
export function getQuote() {
	return getQuotes( 1 ).pop();
}
