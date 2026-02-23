import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Expenses from './pages/Expenses';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 1. Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// 2. Sales
import NewSale from './pages/1.sales/NewSale';

// 3. Supplier
import SupplierOut from './pages/2.supplier/1.SupplierOut';
import SupplierIn from './pages/2.supplier/2.SupplierIn';

// 4. Job Card
import JobOpen from './pages/3.jobcard/1.JobOpen';
import JobClose from './pages/3.jobcard/2.JobClose';

// 5. Service
import ServiceNew from './pages/4.service/1.ServiceNew';
import ServiceBill from './pages/4.service/2.ServiceBill';

// 6. Reports
import Reports from './pages/5..reports/Reports';
import SalesHistory from './pages/SalesHistory';
import WarrantyTracker from './pages/2.supplier/WarrantyTracker';
import CustomerMaster from './pages/3.jobcard/CustomerMaster';
import CreateStaff from './components/CreateStaff';
import WalkInInquiry from './pages/WalkInInquiry';
import ViewInquiries from './pages/ViewInquiries';
import OpenJobCard from './pages/OpenJobCard';

function App() {
  const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Auto-refreshes data when user clicks back into the tab!
      staleTime: 1000 * 60 * 1, // Keep data fresh for 1 minute before refetching
    },
  },
});
  return (
    <QueryClientProvider client={queryClient}>

    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      <Routes>
        {/* Auth & Dashboard */}
        <Route path="/" element={<Login />} />
   <Route path="/dashboard" element={<Dashboard /> } />

        {/* Operations */}
        <Route path="/master/client" element={<NewSale />} />
        
        <Route path="/master/supplier" element={<SupplierOut />} />
        <Route path="/master/supplier2" element={<SupplierIn />} />

        <Route path="/master/customer2" element={<JobOpen />} />
        <Route path="/master/customer" element={<JobClose />} />

        <Route path="/master/service2" element={<ServiceNew />} />
        <Route path="/master/service" element={<ServiceBill />} />

        <Route path="/master/Reports" element={<Reports />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/list" element={<SalesHistory />} />

        <Route path="/warranty" element={<WarrantyTracker />} />
           <Route path="/warranty2" element={<CustomerMaster />} />
               <Route path="/staff" element={<CreateStaff />} />
               <Route path="/inquiries" element={<WalkInInquiry />} />
               <Route path="/view-inquiries" element={<ViewInquiries />} />
              
      </Routes> 
    </Router>
    </QueryClientProvider>
  );
}

export default App;