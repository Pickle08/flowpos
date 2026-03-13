import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient"; // Pastikan path ini benar

export default function TransactionTable() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from("transactions") // Pastikan nama tabel di Supabase sama
                .select("*")
                .order("created_at", { ascending: false }) // Terbaru di atas
                .limit(5); // Batasi 5 transaksi terakhir

            if (error) throw error;
            setTransactions(data || []);
        } catch (err) {
            console.error("Error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Memuat data...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                {/* ... (bagian thead tetap sama) ... */}
                <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                                {tx.customer_name || "Pelanggan"}
                            </td>
                            <td className="py-4 px-4 font-semibold">
                                Rp {(tx.total || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        tx.status === "Success"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-yellow-100 text-yellow-600"
                                    }`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
