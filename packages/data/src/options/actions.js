/**
 * External Dependencies
 */

import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal Dependencies
 */
import TYPES from './action-types';
import { WC_ADMIN_NAMESPACE } from '../constants';

export function recieveOptions( options ) {
	return {
		type: TYPES.RECIEVE_OPTIONS,
		options,
	};
}

export function setIsRequesting( isRequesting ) {
	return {
		type: TYPES.SET_IS_REQUESTING,
		isRequesting,
	};
}

export function setError( error ) {
	return {
		type: TYPES.SET_ERROR,
		error,
	};
}

export function* updateOptions( data ) {
	yield setIsRequesting( true );

	try {
		const results = yield apiFetch( {
			path: WC_ADMIN_NAMESPACE + '/options',
			method: 'POST',
			data,
		} );

		// Add results to state or something and check for error.
		yield setIsRequesting( false );
		return results;
	} catch ( error ) {
		yield setError( error );
		return error;
	}
}
