import React from 'react'
import { Router } from '@reach/router'

// utils

// assets

// actions

// components
import Home from './Home'
import AdAccount from './AdAccount'

// self-defined-components
const App = () => {
  return (
    <Router basepath="/" primary={false}>
      <Home path='/' />
      <AdAccount path='/ad-account/:adAccountId' />
    </Router>
  )
}

export default App
