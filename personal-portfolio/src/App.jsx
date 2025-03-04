import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import CustomCursor from "./components/ui/CustomCursor";
import ParticlesBackground from "./components/ui/ParticlesBackground";

function App() {
  return (
    <>
      <BrowserRouter>
        <ParticlesBackground />
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
