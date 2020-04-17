/**
 * Internal dependencies
 */
import TYPES from './action-types';

const optionsReducer = ( state = {}, { type, options } ) => {
    switch ( type ) {
        case TYPES.RECIEVE_OPTIONS:
            state = {
                ...state,
                ...options,
            };
    }
    return state;
};

export default optionsReducer;