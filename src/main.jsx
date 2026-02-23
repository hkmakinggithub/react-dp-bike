import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// 1. IMPORT REACT QUERY
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Auto-refreshes data when user clicks back into the tab!
      staleTime: 1000 * 60 * 1, // Keep data fresh for 1 minute before refetching
    },
  },
});
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. WRAP YOUR APP */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  
  </StrictMode>,
)
