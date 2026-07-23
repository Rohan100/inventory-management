import React from "react";
import MetricCards from "../components/MetricCards";
import { Package, AlertTriangle, Clock } from "lucide-react";

export default function Dashboard() {
    const products = [
        {
            id: 1,
            name: "Mechanical Keyboard",
            available_quantity: 20,
            low_stock_threshold: 5,
            supplier: "Logitech",
        },
        {
            id: 2,
            name: "Gaming Mouse",
            available_quantity: 4,
            low_stock_threshold: 10,
            supplier: "Razer",
        },
        {
            id: 3,
            name: "27-inch Monitor",
            available_quantity: 8,
            low_stock_threshold: 6,
            supplier: "Dell",
        },
        {
            id: 4,
            name: "USB-C Hub",
            available_quantity: 2,
            low_stock_threshold: 8,
            supplier: "Anker",
        },
        {
            id: 5,
            name: "SSD 1TB",
            available_quantity: 14,
            low_stock_threshold: 5,
            supplier: "Samsung",
        },
    ];

    const reorders = [
        {
            id: 1,
            reorder_status: "PENDING_APPROVAL",
            total_cost: 1250,
            supplier: "Logitech",
        },
        {
            id: 2,
            reorder_status: "APPROVED",
            total_cost: 800,
            supplier: "Dell",
        },
        {
            id: 3,
            reorder_status: "PENDING_APPROVAL",
            total_cost: 2100,
            supplier: "Samsung",
        },
    ];

    const recentActivity = [
        "Keyboard stock updated (+15)",
        "Purchase Order #102 approved",
        "USB Hub reached low stock",
        "SSD shipment received",
    ];

    return (
        <div className="space-y-8">

            <div>
                <h1 className="text-4xl font-bold text-white">
                    Inventory Dashboard
                </h1>

                <p className="text-slate-400 mt-2">
                    Monitor inventory levels, supplier orders and warehouse health.
                </p>
            </div>

            <MetricCards
                products={products}
                reorders={reorders}
            />

            <div className="grid lg:grid-cols-2 gap-6">

                {/* Low Stock */}

                <div className="glass-panel rounded-3xl p-6 border border-slate-800">

                    <div className="flex items-center gap-3 mb-5">

                        <AlertTriangle className="text-amber-400" />

                        <h2 className="text-xl font-bold text-white">
                            Low Stock Products
                        </h2>

                    </div>

                    <div className="space-y-4">

                        {products
                            .filter(
                                p =>
                                    p.available_quantity <
                                    p.low_stock_threshold
                            )
                            .map(product => (
                                <div
                                    key={product.id}
                                    className="flex justify-between items-center border-b border-slate-800 pb-3"
                                >
                                    <div>
                                        <h3 className="text-white font-semibold">
                                            {product.name}
                                        </h3>

                                        <p className="text-sm text-slate-400">
                                            Supplier: {product.supplier}
                                        </p>
                                    </div>

                                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                                        {product.available_quantity} Left
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Recent Activity */}

                <div className="glass-panel rounded-3xl p-6 border border-slate-800">

                    <div className="flex items-center gap-3 mb-5">

                        <Clock className="text-blue-400" />

                        <h2 className="text-xl font-bold text-white">
                            Recent Activity
                        </h2>

                    </div>

                    <div className="space-y-4">

                        {recentActivity.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <Package
                                    size={18}
                                    className="text-indigo-400"
                                />

                                <span className="text-slate-300">
                                    {item}
                                </span>
                            </div>
                        ))}

                    </div>

                </div>

            </div>
        </div>
    );
}