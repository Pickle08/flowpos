import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // State baru untuk pencarian
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        barcode: "",
        price: 0,
        stock: 0,
        category_id: "",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            barcode: "",
            price: 0,
            stock: 0,
            category_id: "",
        });
        setEditingId(null);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await supabase.from("products").select("*");
        if (error) {
            console.error("Error fetching:", error);
            return;
        }
        setProducts(data || []);
    };

    // Logika Filter: Filter produk berdasarkan nama atau barcode
    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchTerm)) ||
            (p.category_id &&
                p.category_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.barcode)
            return alert("Nama dan Barcode wajib diisi!");

        setLoading(true); // Mulai loading
        try {
            const payload = {
                name: formData.name,
                barcode: formData.barcode,
                price: Number(formData.price) || 0,
                stock: Number(formData.stock) || 0,
                // Jika category_id kosong, kirim null agar tidak error di database
                category_id: formData.category_id || null,
            };

            const { error } = editingId
                ? await supabase
                      .from("products")
                      .update(payload)
                      .eq("id", editingId)
                : await supabase.from("products").insert([payload]);

            if (error) throw error;

            alert(
                editingId
                    ? "Produk berhasil diperbarui!"
                    : "Produk berhasil ditambah!"
            );

            resetForm();
            setEditingId(null); // Penting! Kembalikan ke mode tambah setelah edit selesai
            fetchProducts();
        } catch (err) {
            alert("Gagal menyimpan data: " + err.message);
        } finally {
            setLoading(false); // Matikan loading apa pun hasilnya
        }
    };

    const deleteProduct = async (id) => {
        if (!confirm("Yakin hapus produk ini?")) return;

        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);
            if (error) {
                // Jika error karena sudah pernah transaksi, beri pesan yang ramah
                if (error.code === "23503") {
                    alert(
                        "Produk tidak bisa dihapus karena sudah pernah terjual. Kamu bisa mengeditnya saja."
                    );
                } else {
                    throw error;
                }
            } else {
                fetchProducts();
            }
        } catch (err) {
            alert("Gagal: " + err.message);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
                Manajemen Inventory
            </h1>

            {/* Form Input */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    {editingId ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                        name="name"
                        placeholder="Nama Produk"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                        name="barcode"
                        placeholder="Barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                        name="price"
                        type="number"
                        placeholder="Harga"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                        name="stock"
                        type="number"
                        placeholder="Stok"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                        <option value="">Pilih Kategori</option>
                        <option value="Makanan">Makanan</option>
                        <option value="Minuman">Minuman</option>
                    </select>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`mt-4 w-full md:w-auto font-semibold py-2.5 px-8 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : editingId
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                    }`}>
                    {loading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <>
                            <span>
                                {editingId
                                    ? "💾 Update Produk"
                                    : "➕ Simpan Produk"}
                            </span>
                        </>
                    )}
                </button>
            </div>

            {/* Fitur Pencarian */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Cari produk, barcode, atau kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
            </div>

            {/* Tabel */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-emerald-50 border-b border-emerald-100">
                        <tr>
                            {[
                                "Nama",
                                "Barcode",
                                "Harga",
                                "Stok",
                                "Kategori",
                                "Aksi",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="p-4 font-semibold text-emerald-800">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((p) => (
                            <tr
                                key={p.id}
                                className="hover:bg-emerald-50/30 transition-colors">
                                <td className="p-4 font-medium">{p.name}</td>
                                <td className="p-4 text-gray-600">
                                    {p.barcode}
                                </td>
                                <td className="p-4 text-gray-600">
                                    Rp {Number(p.price).toLocaleString()}
                                </td>
                                <td className="p-4 font-semibold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        {/* Angka Stok */}
                                        <span>{p.stock}</span>

                                        {/* Badge Peringatan - Hanya muncul jika < 5 */}
                                        {Number(p.stock) < 5 && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
                                                <span className="text-[8px]">
                                                    ⚠️
                                                </span>{" "}
                                                STOK RENDAH
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                        {p.category_id}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingId(p.id); // Simpan ID untuk mode Edit
                                            setFormData({
                                                name: p.name,
                                                barcode: p.barcode,
                                                price: p.price,
                                                stock: p.stock,
                                                category_id: p.category_id,
                                            }); // Isi form dengan data produk yang diklik
                                            window.scrollTo({
                                                top: 0,
                                                behavior: "smooth",
                                            }); // Scroll otomatis ke atas
                                        }}
                                        className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-100 hover:border-emerald-300 font-medium text-xs transition-all">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(p.id)}
                                        className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 font-medium text-xs transition-all">
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
