import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Fees from './pages/Fees';
import Complaints from './pages/Complaints';
import Inquiries from './pages/Inquiries';
import Parcels from './pages/Parcels';
import LostFound from './pages/LostFound';
import Roommates from './pages/Roommates';
import Feedback from './pages/Feedback';
import Laundry from './pages/Laundry';
import Emergency from './pages/Emergency';
import Allocations from './pages/Allocations';
import Leaves from './pages/Leaves';
import Visitors from './pages/Visitors';
import Biometric from './pages/Biometric';
import DataGrid from './components/DataGrid';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<DataGrid title="Students" endpoint="/students" dataKey="students" />} />
          <Route path="staff" element={<DataGrid title="Staff" endpoint="/staff" dataKey="staff" />} />
          <Route path="blocks" element={<DataGrid title="Hostel Blocks" endpoint="/blocks" dataKey="blocks" />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="allocations" element={<Allocations />} />
          <Route path="fees" element={<Fees />} />
          <Route path="payments" element={<DataGrid title="Payments" endpoint="/payments" dataKey="payments" />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="parcels" element={<Parcels />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="lost-found" element={<LostFound />} />
          <Route path="roommates" element={<Roommates />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="laundry" element={<Laundry />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="biometric" element={<Biometric />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
