import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Download, LayoutDashboard, Sparkles, Receipt, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const PaymentSuccessModal = ({ isOpen, onClose, subscriptionDetails }) => {
  const navigate = useNavigate();

  if (!isOpen || !subscriptionDetails) return null;

  const { planName, amount, paymentId, orderId, renewDate, billingCycle } = subscriptionDetails;

  const handleDownloadInvoice = () => {
    // Generate invoice document print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to download your invoice.");
      return;
    }

    const formattedDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - EbookVala Subscription ${paymentId}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .invoice-header { display: flex; justify-content: space-between; border-b: 2px solid #e2e8f0; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .invoice-title { font-size: 28px; font-weight: bold; text-align: right; color: #0f172a; }
            .details { display: flex; justify-content: space-between; margin: 30px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background: #f8fafc; font-size: 12px; text-transform: uppercase; }
            .total { font-size: 18px; font-weight: bold; color: #3b82f6; }
            .footer { margin-top: 50px; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <div class="logo">EbookVala</div>
              <p style="margin: 4px 0; font-size: 12px; color: #64748b;">Next-Gen Digital eBook Marketplace</p>
              <p style="margin: 2px 0; font-size: 12px; color: #64748b;">GSTIN: 24AAAAA0000A1Z5</p>
            </div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <p style="margin: 4px 0; font-size: 12px;">Date: ${formattedDate}</p>
              <p style="margin: 2px 0; font-size: 12px;">Payment ID: ${paymentId}</p>
            </div>
          </div>

          <div class="details">
            <div>
              <strong>Billed To:</strong>
              <p style="margin: 4px 0; font-size: 13px;">Subscriber</p>
              <p style="margin: 2px 0; font-size: 13px;">India</p>
            </div>
            <div>
              <strong>Subscription Plan:</strong>
              <p style="margin: 4px 0; font-size: 13px;">${planName} Plan (${billingCycle || "Monthly"})</p>
              <p style="margin: 2px 0; font-size: 13px;">Status: Active</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Cycle</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EbookVala ${planName} Plan Subscription Access</td>
                <td>${billingCycle || "Monthly"}</td>
                <td>₹${amount}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px;">
            <p class="total">Total Amount Paid: ₹${amount}</p>
          </div>

          <div class="footer">
            <p>Thank you for subscribing to EbookVala! For support, email support@ebookvala.com</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    toast.success("Invoice downloaded! 📄");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-[#000000_0_0_0] z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative w-full max-w-md bg-brand-card border border-brand-accent/40 rounded-[32px] p-6 sm:p-8 shadow-[0_0_50px_rgba(59,130,246,0.3)] z-10 text-center overflow-hidden"
        >
          {/* Confetti sparkle particles background animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 1, x: Math.random() * 300 - 150 }}
                animate={{ y: 400, opacity: 0, rotate: 360 }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinite, ease: "linear" }}
                className={`absolute top-0 left-1/2 w-2 h-2 rounded-full ${
                  i % 3 === 0 ? "bg-amber-400" : i % 3 === 1 ? "bg-brand-accent" : "bg-emerald-400"
                }`}
              />
            ))}
          </div>

          {/* Icon Badge */}
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
          </div>

          {/* Heading */}
          <h3 className="text-2xl sm:text-3xl font-display font-black text-brand-text tracking-tight">
            Subscription Active!
          </h3>
          <p className="text-xs text-brand-text-secondary mt-1 font-normal">
            Welcome to <span className="text-brand-accent font-bold">{planName} Plan</span>! Your account has been upgraded.
          </p>

          {/* Transaction Summary Card */}
          <div className="my-6 p-4 bg-brand-bg-secondary border border-brand-border rounded-2xl text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border/80">
              <span className="text-brand-text-secondary flex items-center gap-1.5 font-medium">
                <Receipt className="h-3.5 w-3.5 text-brand-accent" /> Payment ID:
              </span>
              <span className="font-mono font-bold text-brand-text text-[11px]">{paymentId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-brand-text-secondary font-medium">Amount Paid:</span>
              <span className="font-bold text-emerald-400">₹{amount}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-brand-text-secondary font-medium">Billing Cycle:</span>
              <span className="font-bold text-brand-text capitalize">{billingCycle || "Monthly"}</span>
            </div>

            {renewDate && (
              <div className="flex justify-between items-center pt-2 border-t border-brand-border/80">
                <span className="text-brand-text-secondary flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" /> Auto-Renews On:
                </span>
                <span className="font-bold text-brand-text">
                  {new Date(renewDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onClose();
                navigate("/dashboard");
              }}
              variant="primary"
              className="w-full rounded-xl py-3 text-xs font-bold shadow-brand flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>

            <Button
              onClick={handleDownloadInvoice}
              variant="ghost"
              className="w-full rounded-xl py-2.5 text-xs font-bold border border-brand-border text-brand-text hover:bg-brand-bg-secondary flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4 text-brand-accent" />
              Download Invoice PDF
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
