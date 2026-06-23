import React, { useState } from "react";
import { MdQrCodeScanner, MdContentCopy, MdCheck } from "react-icons/md";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function SepayPaymentCard({ orderId, totalAmount }) {
  const { t, language } = useLanguage();
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  const EXCHANGE_RATE = 25000;
  const amountInVnd = Math.round(totalAmount * EXCHANGE_RATE);
  const transferContent = `THANH TOAN DON HANG ${orderId.slice(-8).toUpperCase()}`;
  const qrCodeUrl = `https://qr.sepay.vn/img?acc=VQRQAJMLF1010&bank=MBBank&amount=${amountInVnd}&des=${encodeURIComponent(transferContent)}`;

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-high rounded-2xl border border-outline-variant p-6 mb-8 text-left shadow-sm">
      <h3 className="text-h3 font-h3 text-on-surface mb-6 flex items-center gap-2">
        <MdQrCodeScanner className="text-primary" size={24} />
        {t("checkout.sepayTitle")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        {/* QR Code Image */}
        <div className="md:col-span-2 flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl border border-outline-variant shadow-sm max-w-[240px]">
            <img
              src={qrCodeUrl}
              alt={t("checkout.sepayQrAlt")}
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-body-xs text-on-surface-variant mt-2 text-center">
            {t("checkout.sepayQrInstruction")}
          </p>
        </div>

        {/* Bank details */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-xl text-body-sm text-on-surface-variant mb-2">
            <span className="font-semibold text-primary">{t("checkout.sepayExchangeRateLabel")}</span> 1 USD = 25,000 VND
          </div>

          <div className="space-y-3">
            <div className="flex justify-between border-b border-outline-variant/60 pb-2">
              <span className="text-on-surface-variant text-body-sm">{t("checkout.sepayBankLabel")}</span>
              <span className="font-semibold text-on-surface text-body-sm">{t("checkout.sepayBankName")}</span>
            </div>

            <div className="flex justify-between border-b border-outline-variant/60 pb-2 items-center">
              <span className="text-on-surface-variant text-body-sm">{t("checkout.sepayAccountNumberLabel")}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-on-surface text-body-sm">VQRQAJMLF1010</span>
                <button
                  onClick={() => copyToClipboard("VQRQAJMLF1010", setCopiedAccount)}
                  className="p-1 hover:bg-primary/10 rounded text-primary transition"
                  title={t("checkout.sepayCopyAccountTooltip")}
                >
                  {copiedAccount ? (
                    <MdCheck className="text-success" size={16} />
                  ) : (
                    <MdContentCopy size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between border-b border-outline-variant/60 pb-2">
              <span className="text-on-surface-variant text-body-sm">{t("checkout.sepayAccountHolderLabel")}</span>
              <span className="font-semibold text-on-surface text-body-sm uppercase">HOANG KIM QUY PHU</span>
            </div>

            <div className="flex justify-between border-b border-outline-variant/60 pb-2">
              <span className="text-on-surface-variant text-body-sm">{t("checkout.sepayAmountLabel")}</span>
              <div className="text-right">
                <span className="font-bold text-primary text-body-md">
                  {language === "vi" ? amountInVnd.toLocaleString("vi-VN") : amountInVnd.toLocaleString("en-US")} VND
                </span>
                <span className="text-body-xs text-on-surface-variant block">
                  {t("checkout.sepayUsdConversion").replace("${amount}", totalAmount.toFixed(2))}
                </span>
              </div>
            </div>

            <div className="flex justify-between border-b border-outline-variant/60 pb-2 items-center">
              <span className="text-on-surface-variant text-body-sm">{t("checkout.sepayTransferContentLabel")}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold font-mono text-on-surface text-body-sm bg-surface px-2 py-0.5 rounded border border-outline-variant">{transferContent}</span>
                <button
                  onClick={() => copyToClipboard(transferContent, setCopiedContent)}
                  className="p-1 hover:bg-primary/10 rounded text-primary transition"
                  title={t("checkout.sepayCopyContentTooltip")}
                >
                  {copiedContent ? (
                    <MdCheck className="text-success" size={16} />
                  ) : (
                    <MdContentCopy size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
