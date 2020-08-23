import React from 'react'
import ReactDOM from 'react-dom'
import App from './pages/App'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import rootReducer from './reducers'
import rootSaga from './sagas'
import createSagaMiddleware from 'redux-saga'

import 'bootstrap/dist/css/bootstrap.min.css'

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: rootReducer,
  middleware: [sagaMiddleware],
})

sagaMiddleware.run(rootSaga)

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
)
