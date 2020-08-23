import { createSlice, createAction } from '@reduxjs/toolkit'

const adAccountsSlice = createSlice({
  name: 'adAccounts',
  initialState: {
    data: [],
  },
  // reducers support `immer` so you can mutate the state in slice.
  reducers: {
    setAdAccounts(state, action) {
      if (!action.payload) {
        return { data: [] }
      }
      return {
        ...state,
        ...action.payload,
      }
    },
  },
})

export const { setAdAccounts } = adAccountsSlice.actions
export default adAccountsSlice.reducer
