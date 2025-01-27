import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), "@babel/plugin-proposal-optional-chaining"],
},
{

  "plugins": ["@babel/plugin-proposal-optional-chaining"]

})
