import React from "react";

// Komponen ini tidak akan tampil di layar, hanya untuk proses cetak
export const Receipt = React.forwardRef(
    ({ cart, total, cashAmount, changeAmount, invoiceNumber }, ref) => {
        return (
            <div
                ref={ref}
                className="p-8 w-[80mm] text-[12px] font-mono text-black">
                <div className="text-center mb-4">
                    <h1 className="font-bold text-lg">TOKO KITA</h1>
                    <p>Jl. Contoh No. 123, Jember</p>
                    <p className="mt-2 border-b border-black border-dashed pb-2">
                        Inv: {invoiceNumber}
                    </p>
                </div>

                <div className="space-y-1 mb-4">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex justify-between">
                            <span>
                                {item.name} x{item.quantity}
                            </span>
                            <span>
                                Rp{" "}
                                {(item.price * item.quantity).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-black border-dashed pt-2 space-y-1">
                    <div className="flex justify-between font-bold">
                        <span>TOTAL</span>
                        <span>Rp {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tunai</span>
                        <span>Rp {cashAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kembali</span>
                        <span>Rp {changeAmount.toLocaleString()}</span>
                    </div>
                </div>
                <div className="text-center mt-6">Terima Kasih!</div>
            </div>
        );
    }
);
