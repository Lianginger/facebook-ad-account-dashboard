import { combineReducers } from 'redux'
import userReducer from '../features/user/userSlice'
import adAccountsReducer from '../features/adAccounts/adAccountsSlice'

export default combineReducers({
  user: userReducer,
  adAccounts: adAccountsReducer,
})
