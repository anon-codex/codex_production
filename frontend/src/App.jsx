import React from 'react'
import Youtube from './pages/Youtube'
import {Routes,Route} from 'react-router-dom';
import Instadown from './pages/Instadown'
import About from './pages/About';
import Navbar from './sections/Navbar';
import Footer from './sections/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';


const App = () => {
  return (
   <div>
    <Navbar />
    <Routes>
      <Route path='/' element={<Youtube />} />
      <Route path='/insta' element={<Instadown />} />
      <Route path='/about' element={<About />} />
      <Route path='/privacy-policy' element={<PrivacyPolicy />} />
    </Routes>
    <Footer />
   </div>
  )
}

export default App