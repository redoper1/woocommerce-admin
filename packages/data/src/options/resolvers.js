/**
 * External Dependencies
 */

import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { WC_ADMIN_NAMESPACE } from '../constants';
import { recieveOptions, setIsRequesting, setError } from './actions';

export function* getOptionsWithRequest( names ) {
    yield setIsRequesting( true );
    const url = WC_ADMIN_NAMESPACE + '/options?options=' + names.join( ',' );
    
    try {
        const results = yield apiFetch( { path: url } );
        yield recieveOptions( results );
        return results;
    } catch ( error ) {
        yield setError( error );
        return error;
    }
};