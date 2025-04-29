import './App.css';
import ResponsiveAppBar from './components/navbar/navbar';

import Home from './paginas/Home.jsx'

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Container } from '@mui/material';

function App() {

  return (
    <div className="App">

      <BrowserRouter>
        <Container>
          <ResponsiveAppBar />

          <Routes>
            <Route exact path="" element={<Home />} />

          </Routes>

        </Container>
      </BrowserRouter>
    </div>
  )
}

export default App
