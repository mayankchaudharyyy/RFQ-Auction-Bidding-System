import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuctionListing from './pages/AuctionListing';
import AuctionDetails from './pages/AuctionDetails';
import CreateRFQ from './pages/CreateRFQ';
import SubmitBid from './pages/SubmitBid';

function App() {
    return (
        <BrowserRouter>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1, padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                    <Routes>
                        <Route path="/" element={<AuctionListing />} />
                        <Route path="/auction/:id" element={<AuctionDetails />} />
                        <Route path="/create" element={<CreateRFQ />} />
                        <Route path="/bid/:rfq_id" element={<SubmitBid />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;