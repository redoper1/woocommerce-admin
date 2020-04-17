/**
 * Internal dependencies
 */
import TYPES from './action-types';

const optionsReducer = (
	state = { isRequesting: false },
	{ type, options, isRequesting, error }
) => {
	switch ( type ) {
		case TYPES.RECIEVE_OPTIONS:
			state = {
				...state,
				...options,
				isRequesting: false,
			};
			break;
		case TYPES.SET_IS_REQUESTING:
			state = {
				...state,
				isRequesting,
			};
			break;
		case TYPES.SET_ERROR:
			state = {
				...state,
                error,
                isRequesting: false,
			};
			break;
	}
	return state;
};

export default optionsReducer;
