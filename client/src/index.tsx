/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * Entry point for the client-side application.
 * This file is responsible for rendering the application to the DOM.
 *
 */

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App/App'
// import { StrictMode } from 'react'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Could not find root element')
}

const root = createRoot(rootElement)

root.render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>
)
