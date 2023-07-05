const initialState = {
	countryInAmworld: '',
}

export const countryReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'SET_COUNTRY':
			console.log('SET_COUNTRY', action.payload)
			return {
				...state,
				countryInAmworld: action.payload,
			}
		default:
			return state;
	}
}