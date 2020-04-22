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

export function setRequestingError( error ) {
	return {
		type: TYPES.SET_REQUESTING_ERROR,
		error,
	};
}

export function setUpdatingError( error ) {
	return {
		type: TYPES.SET_UPDATING_ERROR,
		error,
	};
}

export function setIsUpdating( isUpdating ) {
	return {
		type: TYPES.SET_IS_UPDATING,
		isUpdating,
	};
}

export function* updateOptions( data ) {
	yield setIsUpdating( true );
	yield recieveOptions( data );

	try {
		const results = yield apiFetch( {
			path: WC_ADMIN_NAMESPACE + '/options',
			method: 'POST',
			data,
		} );

		yield setIsUpdating( false );
		return results;
	} catch ( error ) {
		yield setUpdatingError( error );
		return error;
	}
}
