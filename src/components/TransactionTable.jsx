export default function TransactionTable() {
    const transactions = [
        { id: 1, name: "Kopi Susu", amount: "Rp 15.000", status: "Success" },
        { id: 2, name: "Roti Bakar", amount: "Rp 10.000", status: "Pending" },
        { id: 3, name: "Ice Tea", amount: "Rp 8.000", status: "Success" },
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-gray-400 border-b">
                        <th className="py-3 px-4 font-medium">Customer/Item</th>
                        <th className="py-3 px-4 font-medium">Amount</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">{tx.name}</td>
                            <td className="py-4 px-4 font-semibold">
                                {tx.amount}
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
