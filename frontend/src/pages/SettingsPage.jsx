import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdSettings,
  MdNotifications,
  MdLock,
  MdPalette,
  MdPrivacyTip,
  MdToggleOn,
  MdToggleOff,
  MdEmail,
} from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function SettingsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [settings, setSettings] = useState(() => {
    const storedDark = localStorage.getItem("darkMode") === "true";
    return {
      emailNotifications: true,
      pushNotifications: false,
      orderUpdates: true,
      promotions: false,
      darkMode: storedDark,
      twoFactor: true,
      dataCollection: true,
    };
  });

  const [smtpSettings, setSmtpSettings] = useState({
    smtpEmail: "",
    smtpPassword: "",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
  });

  const [loadingSmtp, setLoadingSmtp] = useState(false);
  const [messageSmtp, setMessageSmtp] = useState("");
  const [errorSmtp, setErrorSmtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const tokenString = localStorage.getItem("token");

    if (!tokenString || !userString) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(userString);
      setCurrentUser(userData);
      fetchSmtpSettings(tokenString);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const fetchSmtpSettings = async (tok) => {
    try {
      const response = await fetch("/api/user/settings/smtp", {
        headers: {
          Authorization: `Bearer ${tok}`,
        },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setSmtpSettings((prev) => ({
          ...prev,
          smtpEmail: result.data.smtpEmail || "",
          smtpHost: result.data.smtpHost || "smtp.gmail.com",
          smtpPort: result.data.smtpPort || 587,
        }));
      }
    } catch (err) {
      console.error("Error fetching SMTP settings:", err);
    }
  };

  const toggleSetting = (key) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (key === "darkMode") {
        localStorage.setItem("darkMode", updated.darkMode.toString());
        if (updated.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return updated;
    });
  };

  const handleSmtpChange = (e) => {
    const { name, value } = e.target;
    setSmtpSettings((prev) => ({
      ...prev,
      [name]: name === "smtpPort" ? parseInt(value) : value,
    }));
  };

  const handleSmtpSave = async (e) => {
    e.preventDefault();
    setLoadingSmtp(true);
    setMessageSmtp("");
    setErrorSmtp("");

    try {
      const response = await fetch("/api/user/settings/smtp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(smtpSettings),
      });

      const result = await response.json();

      if (result.success) {
        setMessageSmtp(t("settings.smtpSaveSuccess"));
        setTimeout(() => setMessageSmtp(""), 4000);
      } else {
        setErrorSmtp(result.message || t("settings.smtpSaveFail"));
      }
    } catch (err) {
      setErrorSmtp("Error: " + err.message);
    } finally {
      setLoadingSmtp(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    setTestingSmtp(true);
    setMessageSmtp("");
    setErrorSmtp("");

    try {
      const response = await fetch("/api/user/settings/smtp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(smtpSettings),
      });

      const result = await response.json();

      if (result.success) {
        setMessageSmtp(t("settings.smtpTestSuccess"));
        setTimeout(() => setMessageSmtp(""), 4000);
      } else {
        setErrorSmtp(result.message || t("settings.smtpTestFail"));
      }
    } catch (err) {
      setErrorSmtp("Error: " + err.message);
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleClearSmtp = async () => {
    if (confirm(t("settings.smtpClearConfirm"))) {
      try {
        const response = await fetch("/api/user/settings/smtp", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          setSmtpSettings({
            smtpEmail: "",
            smtpPassword: "",
            smtpHost: "smtp.gmail.com",
            smtpPort: 587,
          });
          setMessageSmtp(t("settings.smtpClearSuccess"));
          setTimeout(() => setMessageSmtp(""), 4000);
        }
      } catch (err) {
        setErrorSmtp("Error: " + err.message);
      }
    }
  };

  const isAdmin = currentUser?.role === "admin";

  const renderSmtpSection = () => (
    <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm">
      <h2 className="text-h2 font-h2 text-on-surface dark:text-inverse-on-surface mb-6 flex items-center gap-3">
        <MdEmail size={24} className="text-primary" />
        {t("settings.smtpTitle")}
      </h2>

      <div className="space-y-4">
        {messageSmtp && (
          <div className="p-3 bg-success/10 border border-success/20 text-success rounded text-body-sm font-semibold">
            {messageSmtp}
          </div>
        )}

        {errorSmtp && (
          <div className="p-3 bg-error/10 border border-error/20 text-error rounded text-body-sm font-semibold">
            {errorSmtp}
          </div>
        )}

        <p className="text-label-sm text-on-surface-variant dark:text-surface-variant mb-4">
          {t("settings.smtpDesc")}
        </p>

        <form onSubmit={handleSmtpSave} className="space-y-4">
          <div>
            <label className="block text-label-sm font-semibold text-on-surface dark:text-inverse-on-surface mb-1">
              {t("settings.smtpEmailLabel")}
            </label>
            <input
              type="email"
              name="smtpEmail"
              required
              value={smtpSettings.smtpEmail}
              onChange={handleSmtpChange}
              placeholder="your-email@gmail.com"
              className="w-full px-4 py-2 border border-outline-variant dark:border-outline rounded-lg bg-surface dark:bg-inverse-surface text-body-sm text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-label-sm font-semibold text-on-surface dark:text-inverse-on-surface mb-1">
              {t("settings.smtpPasswordLabel")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="smtpPassword"
                required={!smtpSettings.smtpEmail}
                value={smtpSettings.smtpPassword}
                onChange={handleSmtpChange}
                placeholder={smtpSettings.smtpEmail ? t("settings.smtpPasswordPlaceholderFilled") : t("settings.smtpPasswordPlaceholder")}
                className="w-full px-4 py-2 border border-outline-variant dark:border-outline rounded-lg bg-surface dark:bg-inverse-surface text-body-sm text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-on-surface-variant dark:text-surface-variant hover:text-on-surface"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface dark:text-inverse-on-surface mb-1">
                {t("settings.smtpHostLabel")}
              </label>
              <input
                type="text"
                name="smtpHost"
                required
                value={smtpSettings.smtpHost}
                onChange={handleSmtpChange}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2 border border-outline-variant dark:border-outline rounded-lg bg-surface dark:bg-inverse-surface text-body-sm text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface dark:text-inverse-on-surface mb-1">
                {t("settings.smtpPortLabel")}
              </label>
              <input
                type="number"
                name="smtpPort"
                required
                value={smtpSettings.smtpPort}
                onChange={handleSmtpChange}
                placeholder="587"
                className="w-full px-4 py-2 border border-outline-variant dark:border-outline rounded-lg bg-surface dark:bg-inverse-surface text-body-sm text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            <button
              type="submit"
              disabled={loadingSmtp}
              className="px-5 py-2.5 bg-primary text-surface rounded-lg text-body-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition shadow-sm"
            >
              {loadingSmtp ? t("settings.saving") : t("settings.saveConfig")}
            </button>

            <button
              type="button"
              onClick={handleTestSmtpConnection}
              disabled={testingSmtp || !smtpSettings.smtpEmail}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-body-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
            >
              {testingSmtp ? t("settings.testing") : t("settings.testConnection")}
            </button>

            {smtpSettings.smtpEmail && (
              <button
                type="button"
                onClick={handleClearSmtp}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-body-sm font-semibold hover:bg-red-700 transition shadow-sm"
              >
                {t("settings.clear")}
              </button>
            )}
          </div>
        </form>

        <div className="mt-4 p-4 bg-primary/10 dark:bg-primary/20 rounded-xl text-on-primary-container dark:text-inverse-primary">
          <p className="font-semibold text-body-sm mb-2 flex items-center gap-1.5">{t("settings.howToSetupGmail")}</p>
          <ol className="list-decimal list-inside space-y-1 text-label-sm text-on-surface-variant dark:text-surface-variant font-medium">
            <li>{t("settings.setupStep1")}</li>
            <li>{t("settings.setupStep2")}</li>
            <li>{t("settings.setupStep3")}</li>
            <li>{t("settings.setupStep4")}</li>
            <li>{t("settings.setupStep5")}</li>
            <li>{t("settings.setupStep6")}</li>
            <li>{t("settings.setupStep7")}</li>
          </ol>
        </div>
      </div>
    </div>
  );

  if (!currentUser) return null;

  // Render Admin Layout
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background dark:bg-inverse-surface transition-colors duration-200">
        <Sidebar />

        <main className="ml-64 p-8 min-h-screen">
          {/* Page Header */}
          <div className="mb-8 pb-6 border-b border-outline-variant dark:border-outline">
            <h1 className="text-h1 font-h1 text-on-background dark:text-inverse-on-surface flex items-center gap-3">
              <MdSettings size={32} className="text-primary" />
              {t("settings.title")}
            </h1>
            <p className="text-body-md text-on-surface-variant dark:text-surface-variant mt-1">
              {t("settings.adminSubtitle")}
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {renderSmtpSection()}

              {/* Appearance Settings */}
              <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm">
                <h2 className="text-h2 font-h2 text-on-surface dark:text-inverse-on-surface mb-6 flex items-center gap-3">
                  <MdPalette size={24} className="text-primary" />
                  {t("settings.appearanceTitle")}
                </h2>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface dark:text-inverse-on-surface">{t("settings.darkModeLabel")}</p>
                    <p className="text-label-sm text-on-surface-variant dark:text-surface-variant">{t("settings.darkModeDesc")}</p>
                  </div>
                  <button onClick={() => toggleSetting("darkMode")} className="text-primary text-3xl">
                    {settings.darkMode ? <MdToggleOn /> : <MdToggleOff />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-surface-container-lowest dark:bg-on-secondary-fixed-variant/20 border border-outline-variant dark:border-outline rounded-xl p-6 shadow-sm">
                <h3 className="text-h3 font-h3 text-on-surface dark:text-inverse-on-surface mb-4">{t("settings.accountInfoTitle")}</h3>
                <div className="space-y-3 text-body-sm">
                  <div>
                    <p className="text-on-surface-variant dark:text-surface-variant font-medium">{t("settings.emailLabel")}</p>
                    <p className="text-on-surface dark:text-inverse-on-surface font-semibold">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant dark:text-surface-variant font-medium">{t("settings.roleLabel")}</p>
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded text-xs">
                      {t("settings.roleSuperAdmin")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-primary/10 rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-primary mb-2">{t("settings.needHelpTitle")}</h3>
                <p className="text-body-sm text-on-surface-variant dark:text-surface-variant mb-4">
                  {t("settings.needHelpAdminDesc")}
                </p>
                <Link
                  to="/dashboard"
                  className="block w-full py-2.5 px-4 bg-primary text-surface rounded-lg text-body-sm font-semibold text-center hover:bg-primary/90 transition shadow-sm"
                >
                  {t("settings.goToDashboard")}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render Customer/Public Layout
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow py-8 px-margin-mobile">
        <div className="w-full max-w-container-max mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-h1 font-h1 text-on-background flex items-center gap-3">
              <MdSettings size={32} className="text-primary" />
              {t("settings.title")}
            </h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              {t("settings.customerSubtitle")}
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
                  {t("settings.notificationsTitle")}
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      key: "emailNotifications",
                      label: t("settings.notifEmailLabel"),
                      description: t("settings.notifEmailDesc"),
                    },
                    {
                      key: "pushNotifications",
                      label: t("settings.notifPushLabel"),
                      description: t("settings.notifPushDesc"),
                    },
                    {
                      key: "orderUpdates",
                      label: t("settings.notifOrderLabel"),
                      description: t("settings.notifOrderDesc"),
                    },
                    {
                      key: "promotions",
                      label: t("settings.notifPromoLabel"),
                      description: t("settings.notifPromoDesc"),
                    },
                  ].map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-3 border-b border-outline-variant last:border-b-0"
                    >
                      <div>
                        <p className="text-body-sm font-semibold text-on-surface">
                          {setting.label}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {setting.description}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSetting(setting.key)}
                        className="text-primary text-3xl"
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
                  {t("settings.securityTitle")}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-outline-variant">
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">
                        {t("settings.twoFactorLabel")}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {t("settings.twoFactorDesc")}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting("twoFactor")}
                      className="text-primary text-3xl"
                    >
                      {settings.twoFactor ? <MdToggleOn /> : <MdToggleOff />}
                    </button>
                  </div>

                  <div className="pt-3">
                    <Link
                      to="/dashboard"
                      className="inline-block px-4 py-2 bg-primary text-surface rounded-lg text-body-sm font-semibold hover:bg-primary/90 transition shadow-sm"
                    >
                      {t("settings.changePasswordLabel")}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h2 className="text-h2 font-h2 text-on-surface mb-6 flex items-center gap-3">
                  <MdPrivacyTip size={24} className="text-primary" />
                  {t("settings.privacyTitle")}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-outline-variant">
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">
                        {t("settings.dataCollectionLabel")}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {t("settings.dataCollectionDesc")}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting("dataCollection")}
                      className="text-primary text-3xl"
                    >
                      {settings.dataCollection ? (
                        <MdToggleOn />
                      ) : (
                        <MdToggleOff />
                      )}
                    </button>
                  </div>

                  <div className="pt-3 space-y-2">
                    <button className="block w-full text-left py-2 px-4 hover:bg-surface-container-low rounded transition text-body-sm font-semibold text-on-surface">
                      {t("settings.viewPrivacyPolicy")}
                    </button>
                    <button className="block w-full text-left py-2 px-4 hover:bg-surface-container-low rounded transition text-body-sm font-semibold text-on-surface">
                      {t("settings.manageCookies")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="bg-surface border border-outline-variant rounded-xl p-6">
                <h2 className="text-h2 font-h2 text-on-surface mb-6 flex items-center gap-3">
                  <MdPalette size={24} className="text-primary" />
                  {t("settings.appearanceTitle")}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">
                        {t("settings.darkModeLabel")}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {t("settings.darkModeDesc")}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting("darkMode")}
                      className="text-primary text-3xl"
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
                  {t("settings.accountInfoTitle")}
                </h3>

                <div className="space-y-3 text-body-sm">
                  <div>
                    <p className="text-on-surface-variant font-medium">{t("settings.emailLabel")}</p>
                    <p className="text-on-surface font-semibold">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant font-medium">{t("settings.roleLabel")}</p>
                    <p className="text-on-surface font-semibold">{t("settings.rolePremiumMember")}</p>
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-primary/10 rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-primary mb-4">
                  {t("settings.needHelpTitle")}
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-4">
                  {t("settings.needHelpCustomerDesc")}
                </p>
                <button className="w-full py-2.5 px-4 bg-primary text-surface rounded-lg text-body-sm font-semibold hover:bg-primary/90 transition shadow-sm">
                  {t("settings.contactSupport")}
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-error/10 border border-error/30 rounded-xl p-6">
                <h3 className="text-h3 font-h3 text-error mb-4">{t("settings.dangerZoneTitle")}</h3>
                <p className="text-body-sm text-on-surface mb-4 font-medium">
                  {t("settings.deleteAccountDesc")}
                </p>
                <Link
                  to="/dashboard"
                  className="block w-full py-2.5 px-4 bg-error text-surface rounded-lg text-body-sm font-semibold text-center hover:bg-error/90 transition shadow-sm"
                >
                  {t("settings.deleteAccountButton")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
