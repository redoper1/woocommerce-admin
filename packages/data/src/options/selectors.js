/**
 * External Dependencies
 */

import { select } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { STORE_NAME } from './constants';

/**
 * 
 * @param {Object} state - Option names
 * @param {Array} names - Option names
 */
export const getOptions = ( state, names ) => {
    // if the options aren't in state, then call on the selector that has a resolver.
    if ( names.some( name => ! state[ name ] ) ) {
        return requestOptions( state, names );
    }

    return names.reduce( ( result, name ) => {
        result[ name ] = state[ name ];
        return result;
    }, {} );
}

export const requestOptions = ( state, names ) => {
    return names.reduce( ( result, name ) => {
        result[ name ] = state[ name ];
        return result;
    }, {} );
};