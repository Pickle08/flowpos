import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./services/supabaseClient"; // Pastikan path ini benar!
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import TransactionTable from "./components/TransactionTable";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";

function App() {
    const [stats, setStats] = useState({ income: 0, balance: 0, expense: 0 });
    const [activeFilter, setActiveFilter] = useState("today");

    useEffect(() => {
        // Ambil data balance (tetap)
        fetchTotalBalance();
        // Ambil data income berdasarkan filter yang dipilih
        fetchStatsByRange(activeFilter);
    }, [activeFilter]); // Efek jalan setiap kali filter berubah

    const fetchTotalBalance = async () => {
        const { data } = await supabase.from("transactions").select("total");
        const total =
            data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
        setStats((prev) => ({ ...prev, balance: total }));
    };

    const fetchStatsByRange = async (range) => {
        let startDate = new Date();
        if (range === "today") startDate.setHours(0, 0, 0, 0);
        if (range === "week")
            startDate.setDate(startDate.getDate() - startDate.getDay());
        if (range === "month") startDate.setDate(1);

        const { data } = await supabase
            .from("transactions")
            .select("total")
            .gte("created_at", startDate.toISOString());

        const totalIncome =
            data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
        setStats((prev) => ({ ...prev, income: totalIncome }));
    };

    return (
        <Router>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1 p-6 overflow-y-auto">
                        <div className="flex gap-2 mb-6">
                            {["today", "week", "month"].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setActiveFilter(range)}
                                    className={`px-4 py-2 rounded-lg capitalize ${
                                        activeFilter === range
                                            ? "bg-blue-600 text-white"
                                            : "bg-white border"
                                    }`}>
                                    {range}
                                </button>
                            ))}
                        </div>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <StatCard
                                                title="Total Balance"
                                                value={`Rp ${stats.balance.toLocaleString()}`}
                                                trend="15.8% up"
                                            />
                                            <StatCard
                                                title="Income"
                                                value={`Rp ${stats.income.toLocaleString()}`}
                                                trend="45.0% up"
                                            />
                                            <StatCard
                                                title="Expense"
                                                value={`Rp ${stats.expense.toLocaleString()}`}
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
