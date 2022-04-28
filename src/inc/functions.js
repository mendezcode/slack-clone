/* functions.js */

// Noop function.
export const noop = () => {};

/**
 * Returns a random item from an array.
 *
 * @param arr Array the input array
 * @return mixed
 */
export function random( arr ) {
	return arr[ Math.floor( Math.random() * arr.length ) ];
}

/**
 * Returns a JSON date timestamp.
 *
 * @return string
 */
export function timestamp( d ) {
	return new Date( d ?? Date.now() ).toJSON();
}
