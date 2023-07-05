import { createStore } from 'redux';
import { countryReducer } from './reducers';

const store = createStore(countryReducer);
export default store;
