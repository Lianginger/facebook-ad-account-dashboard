import { createSlice, createAction } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {},
  // reducers support `immer` so you can mutate the state in slice.
  reducers: {
    setUser(state, action) {
      if (!action.payload) {
        return {}
      }
      return {
        ...state,
        ...action.payload,
      }
    },
  },
})

userSlice.sagas = {
  fetchUserAndAdAccountsAsync: createAction('user/fetchUserAndAdAccountsAsync'),
}

export const { setUser } = userSlice.actions
export const { fetchUserAndAdAccountsAsync } = userSlice.sagas
export default userSlice.reducer
