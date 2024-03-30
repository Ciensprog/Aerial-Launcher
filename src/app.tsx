import { createRoot } from 'react-dom/client'

import { ThemeProvider } from './components/theme-provider'

const root = createRoot(document.getElementById('app'))

root.render(<ThemeProvider>💡</ThemeProvider>)
