export default function StatCard({ title, value, icon, trend }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 font-medium">{title}</p>
                    <h2 className="text-2xl font-bold mt-1 text-gray-800">
                        {value}
                    </h2>
                </div>
                {icon && <div className="text-gray-400">{icon}</div>}
            </div>
            {trend && (
                <p className="text-xs mt-4 text-green-600 font-medium">
                    {trend}
                </p>
            )}
        </div>
    );
}
