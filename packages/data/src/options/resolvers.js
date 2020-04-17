/**
 * External Dependencies
 */

import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { WC_ADMIN_NAMESPACE } from '../constants';
import { recieveOptions } from './actions';

export function* requestOptions( names ) {
    const url = WC_ADMIN_NAMESPACE + '/options?options=' + names.join( ',' );

    try {
        const results = yield apiFetch( { path: url } );
        yield recieveOptions( results );
        return results;
    } catch ( error ) {
        return error;
    }
};