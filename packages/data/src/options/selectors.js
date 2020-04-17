/**
 * External Dependencies
 */

import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_NAME } from './constants';

/**
 * Get options from state tree.
 * 
 * @param {Object} state - Option names
 * @param {Array} names - Option names
 */
export const getOptions = ( state, names ) => {
    // if the options aren't in state, then call on the selector that has a resolver.
    if ( names.some( name => ! state[ name ] ) ) {
        return select( STORE_NAME ).requestOptions( names );
    }

    return names.reduce( ( result, name ) => {
        result[ name ] = state[ name ];
        return result;
    }, {} );
}

/**
 * Get options from state tree or make a request if unresolved.
 * 
 * @param {Object} state - Option names
 * @param {Array} names - Option names
 */
export const requestOptions = ( state, names ) => {
    return names.reduce( ( result, name ) => {
        result[ name ] = state[ name ];
        return result;
    }, {} );
};