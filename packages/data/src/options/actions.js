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