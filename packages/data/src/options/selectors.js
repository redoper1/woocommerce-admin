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
 * @param {Object} state - Reducer state
 * @param {Array} names - Option names
 */
export const getOptions = ( state, names ) => {
    // if the options aren't in state, then call on the selector that has a resolver.
    if ( names.some( name => ! state[ name ] ) ) {
        return select( STORE_NAME ).getOptionsWithRequest( names );
    }

    return names.reduce( ( result, name ) => {
        result[ name ] = state[ name ];
        return result;
    }, {} );
}

/**
 * Get options from state tree or make a request if unresolved.
 * 
 * @param {Object} state - Reducer state
 * @param {Array} names - Option names
 */
export const getOptionsWithRequest = ( state, names ) => {
    return names.reduce( ( result, name ) => {
        result[ name ] = state[ name ];
        return result;
    }, {} );
};

/**
 * Determine if options are being requested.
 * 
 * @param {Object} state - Reducer state
 */
export const isOptionsRequesting = ( state ) => {
    return state.isRequesting || false;
};

/**
 * Determine if an options request resulted in an error.
 * 
 * @param {Object} state - Reducer state
 */
export const getOptionsError = ( state ) => {
    return state.error || false;
};