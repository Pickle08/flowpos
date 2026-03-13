import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import TransactionTable from "./components/TransactionTable";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";

function App() {
    return (
        <Router>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 p-6 overflow-y-auto">
                        <Routes>
                            {/* Rute Home: Menampilkan Dashboard */}
                            <Route
                                path="/"
                                element={
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <StatCard
                                                title="Total Balance"
                                                value="Rp 320.845"
                                                trend="15.8% up"
                                            />
                                            <StatCard
                                                title="Income"
                                                value="Rp 12.378"
                                                trend="45.0% up"
                                            />
                                            <StatCard
                                                title="Expense"
                                                value="Rp 5.788"
                                                trend="12.5% down"
                                            />
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border min-h-[400px]">
                                            <h3 className="font-bold text-gray-700 mb-4">
                                                Recent Activity
                                            </h3>
                                            <TransactionTable />
                                        </div>
                                    </>
                                }
                            />

                            {/* Rute POS: Hanya menampilkan komponen POS */}
                            <Route path="/pos" element={<POS />} />
                            <Route path="/inventory" element={<Inventory />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
