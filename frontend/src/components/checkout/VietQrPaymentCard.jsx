import React, { useState } from "react";
import { MdQrCodeScanner, MdContentCopy, MdCheck } from "react-icons/md";

export default function VietQrPaymentCard({ orderId, totalAmount }) {
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
        Thanh toán chuyển khoản qua mã QR (VietQR)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        {/* QR Code Image */}
        <div className="md:col-span-2 flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl border border-outline-variant shadow-sm max-w-[240px]">
            <img
              src={qrCodeUrl}
              alt="Mã QR Thanh Toán VietQR"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-body-xs text-on-surface-variant mt-2 text-center">
            Quét mã bằng App ngân hàng của bạn để thanh toán nhanh
          </p>
        </div>

        {/* Bank details */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-xl text-body-sm text-on-surface-variant mb-2">
            <span className="font-semibold text-primary">Tỷ giá quy đổi:</span> 1 USD = 25.000 VND
          </div>

          <div className="space-y-3">
            <div className="flex justify-between border-b border-outline-variant/60 pb-2">
              <span className="text-on-surface-variant text-body-sm">Ngân hàng</span>
              <span className="font-semibold text-on-surface text-body-sm">MB Bank (Ngân hàng Quân Đội)</span>
            </div>

            <div className="flex justify-between border-b border-outline-variant/60 pb-2 items-center">
              <span className="text-on-surface-variant text-body-sm">Số tài khoản nhận</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-on-surface text-body-sm">VQRQAJMLF1010</span>
                <button
                  onClick={() => copyToClipboard("VQRQAJMLF1010", setCopiedAccount)}
                  className="p-1 hover:bg-primary/10 rounded text-primary transition"
                  title="Sao chép số tài khoản"
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
              <span className="text-on-surface-variant text-body-sm">Chủ tài khoản</span>
              <span className="font-semibold text-on-surface text-body-sm uppercase">HOANG KIM QUY PHU</span>
            </div>

            <div className="flex justify-between border-b border-outline-variant/60 pb-2">
              <span className="text-on-surface-variant text-body-sm">Số tiền cần thanh toán</span>
              <div className="text-right">
                <span className="font-bold text-primary text-body-md">{amountInVnd.toLocaleString("vi-VN")} VND</span>
                <span className="text-body-xs text-on-surface-variant block">(Quy đổi từ ${totalAmount.toFixed(2)})</span>
              </div>
            </div>

            <div className="flex justify-between border-b border-outline-variant/60 pb-2 items-center">
              <span className="text-on-surface-variant text-body-sm">Nội dung chuyển khoản</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold font-mono text-on-surface text-body-sm bg-surface px-2 py-0.5 rounded border border-outline-variant">{transferContent}</span>
                <button
                  onClick={() => copyToClipboard(transferContent, setCopiedContent)}
                  className="p-1 hover:bg-primary/10 rounded text-primary transition"
                  title="Sao chép nội dung chuyển khoản"
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
