import { Toaster } from "sonner"
import "./App.css"
import Index from "./pages/Index"
const App = () => {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Index />
    </>
  )
}

export default App