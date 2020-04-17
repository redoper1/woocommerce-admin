/**
 * Internal Dependencies
 */
import TYPES from './action-types';

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