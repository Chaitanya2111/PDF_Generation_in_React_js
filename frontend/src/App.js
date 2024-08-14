
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Purchaseordertable from './compnents/Purchaseordertable';
import Purchaseform from './compnents/Purchaseform';
import Pdfformate from './compnents/Pdfformate';



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
{/* <Route path="/" element={<FileUploadComponent/>} /> */}
          <Route path="/" element={<Purchaseordertable/>} /> 
          {/* <Route path="/" element={<Purchaseform/>} />  */}
          <Route path="/purchase/AddPOform" element={<Purchaseform/>} /> 

          {/* <Route path="/" element={<Supplier />} /> */}
          {/* <Route path="/" element={<Pdfformate/>} /> */}
          {/*  */}

         


        </Routes>
      </Router>
    </div>
  );
}

export default App;
