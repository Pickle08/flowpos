import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { Receipt } from "../components/Receipt";
import { useReactToPrint } from "react-to-print";

export default function POS() {
    const [lastInvoice, setLastInvoice] = useState("");
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [cashAmount, setCashAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [todaySales, setTodaySales] = useState(0);

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    // 1. Perhitungan (Total dulu, baru changeAmount)
    const total = useMemo(
        () =>
            cart.reduce(
                (sum, item) => sum + Number(item.price) * item.quantity,
                0
            ),
        [cart]
    );
    const changeAmount = useMemo(
        () => Math.max(0, cashAmount - total),
        [cashAmount, total]
    );

    // 2. Fungsi Fetching
    const fetchProducts = useCallback(async () => {
        const { data, error } = await supabase.from("products").select("*");
        if (error) console.error("Error fetching:", error);
        else setProducts(data || []);
    }, []);

    const getTodaySales = useCallback(async () => {
        const today = new Date().toISOString().split("T")[0];
        const { data, error } = await supabase
            .from("transactions")
            .select("total")
            .gte("created_at", `${today}T00:00:00.000Z`);

        return error
            ? 0
            : data.reduce((sum, item) => sum + Number(item.total), 0);
    }, []);

    useEffect(() => {
        fetchProducts();
        getTodaySales().then(setTodaySales);
    }, [fetchProducts, getTodaySales]);

    // 5. HANDLER
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsLoading(true);

        try {
            const invoiceNum = `INV-${Date.now()}`;

            // A. Update Stok & Log
            for (const item of cart) {
                const { error: stockUpdateError } = await supabase
                    .from("products")
                    .update({ stock: item.stock - item.quantity })
                    .eq("id", item.id);
                if (stockUpdateError) throw stockUpdateError;

                await supabase.from("stock_logs").insert([
                    {
                        product_id: item.id,
                        quantity: item.quantity,
                        type: "OUT",
                        description: `Penjualan Invoice: ${invoiceNum}`,
                    },
                ]);
            }

            // B. Transaksi
            const { data: txData, error: txError } = await supabase
                .from("transactions")
                .insert([
                    {
                        invoice_number: invoiceNum,
                        total,
                        payment_method: "cash",
                        cash_amount: cashAmount,
                        change_amount: changeAmount,
                    },
                ])
                .select()
                .single();
            if (txError) throw txError;

            await supabase.from("transaction_items").insert(
                cart.map((item) => ({
                    transaction_id: txData.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity,
                }))
            );

            // C. Finalisasi
            setLastInvoice(invoiceNum);
            const updatedTotal = await getTodaySales();
            setTodaySales(updatedTotal);
            fetchProducts();

            setTimeout(() => {
                handlePrint();
                alert(`Transaksi Berhasil! ${invoiceNum}`);
                setCart([]);
                setCashAmount(0);
            }, 500);
        } catch (error) {
            console.error(error);
            alert("Gagal memproses transaksi.");
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            return existing
                ? prev.map((i) =>
                      i.id === product.id
                          ? { ...i, quantity: i.quantity + 1 }
                          : i
                  )
                : [...prev, { ...product, quantity: 1, cartId: Date.now() }];
        });
    };

    const removeFromCart = (cartId) =>
        setCart(cart.filter((i) => i.cartId !== cartId));

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* TOP SECTION: Dashboard Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-3">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2rem] shadow-xl shadow-emerald-100 text-white relative overflow-hidden group">
                            {/* Animated Decor */}
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-[0.05] rounded-full transition-transform duration-700 group-hover:scale-110"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-[0.25em] mb-2 opacity-80">
                                        Total Pendapatan Hari Ini
                                    </p>
                                    <h2 className="text-5xl font-black tracking-tight">
                                        Rp {todaySales.toLocaleString()}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-4 bg-black/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                        </span>
                                        <p className="text-emerald-50 text-xs font-medium uppercase">
                                            {new Date().toLocaleDateString(
                                                "id-ID",
                                                {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                }
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                    <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center font-bold text-emerald-900 shadow-inner">
                                        A
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-wider">
                                            Petugas Kasir
                                        </p>
                                        <p className="font-bold text-white">
                                            Administrator
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT: Products & Cart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Daftar Produk */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800">
                                Menu Tersedia
                            </h3>
                            <div className="h-1 flex-1 mx-4 bg-slate-200/50 rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="group relative p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 hover:-translate-y-1 hover:border-emerald-200 text-left transition-all duration-300">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-700 mb-1 group-hover:text-emerald-700 transition-colors">
                                        {product.name}
                                    </h4>
                                    <p className="text-emerald-600 font-black text-lg">
                                        Rp {product.price.toLocaleString()}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                                                product.stock > 0
                                                    ? "bg-slate-100 text-slate-500"
                                                    : "bg-red-50 text-red-500"
                                            }`}>
                                            Stok: {product.stock}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Keranjang (Sticky Sidebar) */}
                    <div className="relative">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8 h-[calc(100vh-4rem)] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-black text-slate-800 text-xl tracking-tight">
                                    Pesanan
                                </h3>
                                <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black">
                                    {cart.reduce(
                                        (sum, i) => sum + i.quantity,
                                        0
                                    )}{" "}
                                    Items
                                </span>
                            </div>

                            {/* Cart Items List */}
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {cart.length > 0 ? (
                                    cart.map((item) => (
                                        <div
                                            key={item.cartId}
                                            className="group flex justify-between items-center p-4 bg-slate-50/50 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">
                                                    {item.name}
                                                </span>
                                                <span className="text-slate-400 text-xs font-medium mt-0.5">
                                                    <span className="text-emerald-600 font-bold">
                                                        {item.quantity}x
                                                    </span>{" "}
                                                    @ Rp{" "}
                                                    {item.price.toLocaleString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeFromCart(item.cartId)
                                                }
                                                className="p-2.5 text-slate-300 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm hover:shadow-red-200">
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2.5}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full mb-4 flex items-center justify-center">
                                            🛒
                                        </div>
                                        <p className="text-sm">
                                            Belum ada pesanan
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Checkout */}
                            <div className="pt-8 mt-4 border-t-2 border-dashed border-slate-100">
                                <div className="mb-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 block">
                                        Input Pembayaran
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            value={cashAmount || ""}
                                            onChange={(e) =>
                                                setCashAmount(
                                                    Number(e.target.value)
                                                )
                                            }
                                            placeholder="0"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-black text-xl text-slate-800 placeholder:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                                        <span>Total Tagihan</span>
                                        <span className="text-slate-800 text-sm tracking-normal">
                                            Rp {total.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                                            Kembalian
                                        </span>
                                        <span
                                            className={`font-black text-2xl tracking-tighter ${
                                                changeAmount > 0
                                                    ? "text-emerald-600"
                                                    : "text-slate-800"
                                            }`}>
                                            Rp {changeAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={
                                        isLoading ||
                                        cart.length === 0 ||
                                        cashAmount < total
                                    }
                                    className={`w-full py-5 rounded-[1.5rem] font-black text-lg shadow-xl transition-all duration-300 ${
                                        isLoading ||
                                        cart.length === 0 ||
                                        cashAmount < total
                                            ? "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
                                            : "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95"
                                    }`}>
                                    {isLoading
                                        ? "PROSES..."
                                        : "KONFIRMASI BAYAR"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hidden Receipt Component */}
            <div style={{ display: "none" }}>
                <Receipt
                    ref={componentRef}
                    cart={cart}
                    total={total}
                    cashAmount={cashAmount}
                    changeAmount={changeAmount}
                    invoiceNumber={lastInvoice}
                />
            </div>
        </div>
    );
}
