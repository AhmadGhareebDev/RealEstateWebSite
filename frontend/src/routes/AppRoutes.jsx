import { Routes , Route} from "react-router-dom"
import Landing from "../features/landing/Landing"
import Layout from "../layout/Layout"
function AppRoutes() {
  return (
    <div>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<Landing/>} />
          </Route> 
        </Routes>
      
    </div>
  )
}

export default AppRoutes
