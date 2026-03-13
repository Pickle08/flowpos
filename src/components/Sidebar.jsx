import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen bg-gray-800 text-white p-5">
            <h2 className="text-2xl font-bold mb-10">FlowPOS</h2>
            <nav>
                <ul className="space-y-4">
                    <li>
                        <Link to="/" className="hover:text-blue-400 transition">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/pos"
                            className="hover:text-blue-400 transition">
                            POS System
                        </Link>
                    </li>
                    <li>
                        <Link to="/inventory">Inventory</Link>
                    </li>
                    {/* Kamu bisa tambah link lainnya di sini */}
                </ul>
            </nav>
        </aside>
    );
}
