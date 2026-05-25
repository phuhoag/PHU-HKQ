import Sidebar from "../components/dashboard/Sidebar.jsx";
import DashboardStats from "../components/dashboard/DashboardStats.jsx";
import SalesAnalytics from "../components/dashboard/SalesAnalytics.jsx";
import RecentActivity from "../components/dashboard/RecentActivity.jsx";
import OrderHistory from "../components/dashboard/OrderHistory.jsx";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 p-8 min-h-screen">
        {/* Top Bar with Title and Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-h1 font-h1 text-on-background">
              Dashboard Overview
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Welcome back, your store is performing 12% better this week.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-body-md font-body-md border border-outline rounded-lg text-on-background hover:bg-surface-container transition">
              Last 30 Days
            </button>
            <button className="px-4 py-2 text-body-md font-body-md bg-primary text-surface rounded-lg hover:bg-primary/90 transition">
              + New Product
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Sales Analytics Chart */}
        <SalesAnalytics />

        {/* Bottom Section - Recent Activities and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities - Left Column */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Recent Orders - Right Column - Placeholder */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h3 className="text-h3 font-h3 text-on-background mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-body-sm text-on-surface-variant">
                  Total Revenue
                </p>
                <p className="text-h2 font-h2 text-primary">$128,430</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <p className="text-body-sm text-on-surface-variant">
                  New Customers
                </p>
                <p className="text-h2 font-h2 text-success">+324</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <p className="text-body-sm text-on-surface-variant">
                  Pending Orders
                </p>
                <p className="text-h2 font-h2 text-warning">42</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History Table */}
        <div className="mt-8">
          <OrderHistory />
        </div>
      </main>
    </div>
  );
}
