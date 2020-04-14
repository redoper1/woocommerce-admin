/**
 * 
 * @param {Object} state - Option names
 * @param {Array} names - Option names
 */
export const getOptions = ( state, names ) => {
    return names.reduce( ( result, name ) => {
        result[ name ] = state[ name ];
        return result;
    }, {} );
}