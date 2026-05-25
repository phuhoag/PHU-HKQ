import { useState } from "react";
import {
  MdSettings,
  MdNotifications,
  MdLock,
  MdPalette,
  MdPrivacyTip,
  MdToggleOn,
  MdToggleOff,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    promotions: false,
    darkMode: false,
    twoFactor: true,
    dataCollection: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow py-8 px-margin-mobile">
        <div className="w-full max-w-container-max mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-h1 font-h1 text-on-background flex items-center gap-3">
              <MdSettings size={32} className="text-primary" />
              Settings
            </h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              Manage your account preferences and security settings
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notifications Settings */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h2 className="text-h2 font-h2 text-on-surface mb-6 flex items-center gap-3">
                  <MdNotifications size={24} className="text-primary" />
                  Notifications
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      key: "emailNotifications",
                      label: "Email Notifications",
                      description: "Receive notifications via email",
                    },
                    {
                      key: "pushNotifications",
                      label: "Push Notifications",
                      description: "Receive browser push notifications",
                    },
                    {
                      key: "orderUpdates",
                      label: "Order Updates",
                      description: "Get notified about your order status",
                    },
                    {
                      key: "promotions",
                      label: "Promotional Emails",
                      description: "Receive deals and special offers",
                    },
                  ].map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-3 border-b border-outline-variant last:border-b-0"
                    >
                      <div>
                        <p className="text-body-sm font-body-sm text-on-surface">
                          {setting.label}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {setting.description}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSetting(setting.key)}
                        className="text-primary text-2xl"
                      >
                        {settings[setting.key] ? (
                          <MdToggleOn />
                        ) : (
                          <MdToggleOff />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h2 className="text-h2 font-h2 text-on-surface mb-6 flex items-center gap-3">
                  <MdLock size={24} className="text-primary" />
                  Security
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-outline-variant">
                    <div>
                      <p className="text-body-sm font-body-sm text-on-surface">
                        Two-Factor Authentication
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        Add extra security to your account
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting("twoFactor")}
                      className="text-primary text-2xl"
                    >
                      {settings.twoFactor ? <MdToggleOn /> : <MdToggleOff />}
                    </button>
                  </div>

                  <div className="pt-3">
                    <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-body-sm hover:bg-primary/90 transition">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h2 className="text-h2 font-h2 text-on-surface mb-6 flex items-center gap-3">
                  <MdPrivacyTip size={24} className="text-primary" />
                  Privacy
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-outline-variant">
                    <div>
                      <p className="text-body-sm font-body-sm text-on-surface">
                        Data Collection
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        Allow us to collect usage data to improve your
                        experience
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting("dataCollection")}
                      className="text-primary text-2xl"
                    >
                      {settings.dataCollection ? (
                        <MdToggleOn />
                      ) : (
                        <MdToggleOff />
                      )}
                    </button>
                  </div>

                  <div className="pt-3 space-y-2">
                    <button className="block w-full text-left py-2 px-4 hover:bg-surface-container-low rounded transition text-body-sm font-body-sm text-on-surface">
                      View Privacy Policy
                    </button>
                    <button className="block w-full text-left py-2 px-4 hover:bg-surface-container-low rounded transition text-body-sm font-body-sm text-on-surface">
                      Manage Cookies
                    </button>
                  </div>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h2 className="text-h2 font-h2 text-on-surface mb-6 flex items-center gap-3">
                  <MdPalette size={24} className="text-primary" />
                  Appearance
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-body-sm font-body-sm text-on-surface">
                        Dark Mode
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        Reduce eye strain with dark theme
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting("darkMode")}
                      className="text-primary text-2xl"
                    >
                      {settings.darkMode ? <MdToggleOn /> : <MdToggleOff />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-on-surface mb-4">
                  Account Info
                </h3>

                <div className="space-y-3 text-body-sm">
                  <div>
                    <p className="text-on-surface-variant">Email</p>
                    <p className="text-on-surface">john@example.com</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Account Type</p>
                    <p className="text-on-surface">Premium Member</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Last Updated</p>
                    <p className="text-on-surface">2 days ago</p>
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-primary-container rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-on-primary-container mb-4">
                  Need Help?
                </h3>
                <p className="text-body-sm text-on-primary-container/80 mb-4">
                  Contact our support team for assistance with your account
                  settings.
                </p>
                <button className="w-full py-2 px-4 bg-primary text-on-primary rounded-lg text-body-sm font-body-sm hover:bg-primary/90 transition">
                  Contact Support
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-error/10 border border-error/30 rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-error mb-4">Danger Zone</h3>
                <p className="text-body-sm text-on-surface mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <button className="w-full py-2 px-4 bg-error text-on-error rounded-lg text-body-sm font-body-sm hover:bg-error/90 transition">
                  Delete Account
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
