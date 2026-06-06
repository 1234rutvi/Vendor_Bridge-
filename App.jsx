import React, { useState, useEffect } from 'react';

export default function App() {
  // This state variable holds your data. When you connect a database later,
  // updating this state will automatically redraw all your charts instantly!
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // MOCK DATABASE FETCH:
    // When your backend is ready, you will replace this with a real API call like:
    // Instead of a static object, you fetch live data from your server
//   fetch('http://localhost:5000/api/reports') 
//     .then(response => response.json())
//     .then(databaseData => {
//       // This single line updates the whole screen instantly with your real data!
//       setReportData(databaseData); 
//     })
//     .catch(error => console.error("Error loading database metrics:", error));
// }, []);
    const mockDatabasePayload = {
      month: "May 2026",
      kpis: [
        { label: "Total Spend", value: "₹12.4 L", color: "text-blue-600" },
        { label: "Active Vendors", value: "28", color: "text-green-600" },
        { label: "PO Fulfillment", value: "94%", color: "text-amber-500" },
        { label: "Overdue Invoices", value: "3", color: "text-red-500" }
      ],
      spendByCategory: [
        { name: "IT Hardware", amount: "₹4.8L", percentage: 80, color: "bg-blue-600" },
        { name: "Furniture", amount: "₹3.2L", percentage: 65, color: "bg-emerald-600" },
        { name: "Stationery", amount: "₹2.1L", percentage: 40, color: "bg-amber-500" },
        { name: "Logistics", amount: "₹2.3L", percentage: 45, color: "bg-orange-600" }
      ],
      topVendors: [
        { name: "TechCore Ltd", spend: "4,20,000", pos: 6 },
        { name: "Infra Supplies", spend: "3,10,000", pos: 4 },
        { name: "FastLog", spend: "1,90,000", pos: 3 }
      ],
      monthlyTrend: [
        { month: "Dec", height: "h-12" },
        { month: "Jan", height: "h-20" },
        { month: "Feb", height: "h-16" },
        { month: "Mar", height: "h-28" },
        { month: "Apr", height: "h-24" },
        { month: "May", height: "h-32", active: true }
      ]
    };

    setReportData(mockDatabasePayload);
  }, []);

  // Show a clean loading message if the data hasn't loaded into state yet
  if (!reportData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans text-lg font-medium text-gray-500">
        Loading Dashboard Data...
      </div>
    );
  }

  const sidebarItems = [
    "Dashboard", "Vendors", "RFQ's", "Quotations", "Approvals", "Purchase orders", "Invoices", "Reports", "Activity"
  ];

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800 w-full">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-gray-300 p-6 flex flex-col gap-y-2 shrink-0">
        <div className="text-xl font-bold tracking-tight mb-8 text-slate-900">VendorBridge</div>
        <nav className="flex flex-col gap-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item}
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item === "Reports" 
                  ? "bg-green-100 text-green-800 border border-green-200" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              — {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8">
        
        {/* HEADER SECTION */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & analytics</h1>
            <p className="text-gray-500 mt-1 text-lg">Procurement Insights - {reportData.month}</p>
          </div>
          <div className="flex gap-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50">
              {reportData.month}
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
              onClick={() => alert("Downloading System Analytics...")}
            >
              Export
            </button>
          </div>
        </header>

        {/* KPI CARDS GRID */}
        <section className="grid grid-cols-4 gap-6 mb-10">
          {reportData.kpis.map((kpi, idx) => (
            <div key={idx} className="border border-gray-300 rounded-xl p-6 bg-white text-center shadow-sm">
              <div className={`text-3xl font-bold mb-2 ${kpi.color}`}>{kpi.value}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</div>
            </div>
          ))}
        </section>

        {/* LOWER GRAPHICS GRID */}
        <section className="grid grid-cols-2 gap-8">
          
          {/* SPEND BY CATEGORY */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Spend by Category</h3>
            <div className="space-y-5">
              {reportData.spendByCategory.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-semibold text-gray-700">
                    <span>{cat.name}</span>
                    <span>{cat.amount}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: VENDORS TABLE & TRENDS */}
          <div className="flex flex-col gap-y-8">
            
            {/* TOP VENDORS TABLE */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Top Vendors by Spend</h3>
              <table className="w-full text-left text-sm text-gray-600">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-medium">
                    <th className="pb-2">Vendor</th>
                    <th className="pb-2">Spend (₹)</th>
                    <th className="pb-2 text-right">POs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {reportData.topVendors.map((vendor, idx) => (
                    <tr key={idx} className="text-gray-700">
                      <td className="py-2.5">{vendor.name}</td>
                      <td className="py-2.5">{vendor.spend}</td>
                      <td className="py-2.5 text-right">{vendor.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MONTHLY TRENDS */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Monthly Trend</h3>
              <div className="flex items-end justify-between h-36 px-4">
                {reportData.monthlyTrend.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-y-2 flex-1">
                    <div className={`w-10 rounded-t ${item.active ? 'bg-blue-600' : 'bg-blue-200'} ${item.height}`}></div>
                    <span className="text-xs text-gray-400 font-semibold">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}