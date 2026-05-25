import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdEdit,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";

export default function ProfilePage() {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Technology Drive, San Francisco, CA 94105",
    joinDate: "January 2024",
    totalOrders: 12,
    totalSpent: "$2,450.00",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow py-8 px-margin-mobile">
        <div className="w-full max-w-container-max mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-h1 font-h1 text-on-background flex items-center gap-3">
              <MdPerson size={32} className="text-primary" />
              My Profile
            </h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-h2 font-h2 text-on-surface">
                    Personal Information
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition">
                    <MdEdit size={18} />
                    <span className="text-body-sm font-body-sm">Edit</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-label-sm text-on-surface-variant">
                      Full Name
                    </label>
                    <p className="text-body-md text-on-surface mt-1">
                      {user.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-label-sm text-on-surface-variant flex items-center gap-2">
                      <MdEmail size={16} />
                      Email Address
                    </label>
                    <p className="text-body-md text-on-surface mt-1">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <label className="text-label-sm text-on-surface-variant flex items-center gap-2">
                      <MdPhone size={16} />
                      Phone Number
                    </label>
                    <p className="text-body-md text-on-surface mt-1">
                      {user.phone}
                    </p>
                  </div>

                  <div>
                    <label className="text-label-sm text-on-surface-variant flex items-center gap-2">
                      <MdLocationOn size={16} />
                      Address
                    </label>
                    <p className="text-body-md text-on-surface mt-1">
                      {user.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Statistics */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h2 className="text-h2 font-h2 text-on-surface mb-6">
                  Account Statistics
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low rounded-lg p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      Member Since
                    </p>
                    <p className="text-h3 font-h3 text-on-surface mt-2">
                      {user.joinDate}
                    </p>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      Total Orders
                    </p>
                    <p className="text-h3 font-h3 text-primary mt-2">
                      {user.totalOrders}
                    </p>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      Total Spent
                    </p>
                    <p className="text-h3 font-h3 text-success mt-2">
                      {user.totalSpent}
                    </p>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      Account Status
                    </p>
                    <p className="text-h3 font-h3 text-secondary mt-2">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-on-surface mb-4">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <button className="w-full py-3 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition text-body-sm font-body-sm">
                    Change Password
                  </button>
                  <button className="w-full py-3 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition text-body-sm font-body-sm">
                    View Orders
                  </button>
                  <button className="w-full py-3 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition text-body-sm font-body-sm">
                    Saved Addresses
                  </button>
                  <button className="w-full py-3 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition text-body-sm font-body-sm">
                    Wishlist
                  </button>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-primary-container rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-on-primary-container mb-2">
                  Account Security
                </h3>
                <p className="text-body-sm text-on-primary-container/80 mb-4">
                  Your account is protected with a strong password and
                  two-factor authentication.
                </p>
                <button className="w-full py-2 px-4 bg-primary text-on-primary rounded-lg text-body-sm font-body-sm hover:bg-primary/90 transition">
                  Review Security
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
