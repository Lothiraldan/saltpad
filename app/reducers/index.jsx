import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { routerReducer } from 'react-router-redux';

import UserReducer from './user';
import RealTimeReducer from './real-time';

const rootReducer = combineReducers({
  form: formReducer, // <-- redux-form
  routing: routerReducer,
  user: UserReducer,
  realTime: RealTimeReducer,
});

export default rootReducer;
