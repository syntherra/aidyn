import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const setTheme = (theme: 'dark' | 'light') => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

setTheme((localStorage.getItem('theme') as 'dark' | 'light') || 'dark')
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
