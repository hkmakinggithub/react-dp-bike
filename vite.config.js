import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
<<<<<<< HEAD
  plugins: [react(), tailwindcss()],
  base: '/',
=======
  plugins: [
    react(),
    tailwindcss(),
  ],
   base: '/',
>>>>>>> d957f4ab82dfda8e92693628ce4e027cc315d7f3
})
