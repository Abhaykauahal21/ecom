"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    createdAt: Date | string;
    totalAmount: number;
    shippingCost: number;
    discountAmount?: number;
    discountCode?: string | null;
    paymentMethod?: string;
    paymentStatus: string | null;
    paymentId: string | null;
    address: {
      name: string;
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      pincode: string;
    };
    orderItems: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        name: string;
        price: number;
      };
    }>;
  } | null;
}

const toNum = (v: unknown, fallback = 0): number => {
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!order) return null;

  const isCOD = order.paymentMethod === "COD";
  const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const baseAmount = subtotal / 1.18;
  const totalGst = subtotal - baseAmount;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const doc = new jsPDF();

      doc.setProperties({
        title: `Invoice_${order.id}`,
        subject: 'Order Tax Invoice',
        author: 'Kavya Boss Nutrition',
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("KAVYA BOSS NUTRITION", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text("Arjun Nagar, Near Patanjali Store, Agra, UP - 282001", 14, 23);
      doc.text("Phone: +91 63975 16655 | GSTIN: 09AABCK1234M1Z5", 14, 28);
      doc.text("Email: support@kavyaboss.com | Web: www.kavyaboss.com", 14, 33);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("TAX INVOICE", 150, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(`Invoice No: INV-${order.id.substring(order.id.length - 8).toUpperCase()}`, 150, 26);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 31);

      if (isCOD) {
        doc.setTextColor(200, 100, 0);
        doc.text("Payment: To Be Paid", 150, 36);
        doc.text("Method: Cash on Delivery", 150, 41);
        doc.setTextColor(60, 60, 60);
      } else {
        doc.text("Payment: PAID by Razorpay", 150, 36);
        doc.text("Method: Online Payment", 150, 41);
        if (order.paymentId) {
          doc.setFontSize(6.5);
          doc.text(`Txn ID: ${order.paymentId}`, 150, 46);
          doc.setFontSize(8);
        }
      }

      const headerBottom = isCOD ? 47 : (order.paymentId ? 52 : 47);

      doc.setDrawColor(220, 220, 220);
      doc.line(14, headerBottom, 196, headerBottom);

      let billY = headerBottom + 7;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("BILL TO:", 14, billY);

      billY += 5;
      doc.setFont("helvetica", "normal");
      doc.text(order.address.name || 'Customer Name', 14, billY);
      doc.text(`Phone: ${order.address.phone}`, 14, billY + 5);
      doc.text(order.address.line1, 14, billY + 10);
      if (order.address.line2) {
        doc.text(order.address.line2, 14, billY + 15);
      }
      doc.text(`${order.address.city}, ${order.address.state} - ${order.address.pincode}`, 14, order.address.line2 ? billY + 20 : billY + 15);

      const tableStartY = order.address.line2 ? billY + 26 : billY + 21;

      const tableRows = order.orderItems.map((item, index) => [
        index + 1,
        item.product.name,
        `INR ${item.price.toFixed(2)}`,
        item.quantity,
        `INR ${(item.price * item.quantity).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Description', 'Unit Price', 'Qty', 'Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8.5, cellPadding: 4, font: 'helvetica' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 92 },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 14, halign: 'center' },
          4: { cellWidth: 35, halign: 'right' }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text("Subtotal:", 130, finalY);
      doc.text(`INR ${subtotal.toFixed(2)}`, 196, finalY, { align: 'right' });

      let y = finalY + 5;
      if ((toNum(order.discountAmount) ?? 0) > 0) {
        doc.setTextColor(0, 140, 0);
        doc.text(
          `Discount${order.discountCode ? ` (Code: ${order.discountCode})` : ''}:`,
          130,
          y
        );
        doc.text(`-INR ${(toNum(order.discountAmount) ?? 0).toFixed(2)}`, 196, y, { align: 'right' });
        y += 5;
        doc.setTextColor(0, 0, 0);
      }

      doc.text("Shipping:", 130, y);
      doc.text(order.shippingCost === 0 ? "FREE" : `INR ${order.shippingCost.toFixed(2)}`, 196, y, { align: 'right' });
      y += 5;

      doc.text("CGST (9% Included):", 130, y);
      doc.text(`INR ${cgst.toFixed(2)}`, 196, y, { align: 'right' });
      y += 5;

      doc.text("SGST (9% Included):", 130, y);
      doc.text(`INR ${sgst.toFixed(2)}`, 196, y, { align: 'right' });
      y += 7;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      if (isCOD) {
        doc.setTextColor(200, 100, 0);
        doc.text("Total Amount (Pay on Delivery):", 130, y);
        doc.text(`INR ${order.totalAmount.toFixed(2)}`, 196, y, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text("Total Amount Paid:", 130, y);
        doc.text(`INR ${order.totalAmount.toFixed(2)}`, 196, y, { align: 'right' });
      }

      const footerY = Math.max(finalY + 36, y + 12);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);

      if (isCOD) {
        doc.text("This is a preliminary invoice. Payment of the above amount is due on delivery.", 14, footerY);
        doc.text("Thank you for your purchase!", 14, footerY + 4);
      } else {
        doc.text("This is a paid tax invoice. Thank you for your purchase!", 14, footerY);
        if (order.paymentId) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.text(`Transaction Reference: ${order.paymentId}`, 14, footerY + 8);
        }
      }

      doc.save(`invoice_${order.id.substring(order.id.length - 8).toUpperCase()}.pdf`);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("[INVOICE_DOWNLOAD_ERROR]", error);
      toast.error("Failed to generate invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-xl border-none shadow-2xl bg-white dark:bg-black backdrop-blur-2xl p-0 rounded-3xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 bg-brand/10 text-brand rounded-full flex items-center justify-center">
              <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-center tracking-tight">
              Download Invoice
            </DialogTitle>
            <DialogDescription className="text-center text-xs sm:text-sm font-medium text-muted-foreground px-2">
              Review the billing breakdown below before generating your PDF invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="my-3 sm:my-4 bg-muted/30 p-3 sm:p-5 rounded-2xl border border-muted/40 text-xs space-y-3 sm:space-y-4 max-h-[50vh] sm:max-h-80 overflow-y-auto">
            <div className="flex flex-col xs:flex-row justify-between items-start gap-2 sm:gap-4">
              <div className="w-full xs:w-auto">
                <p className="font-black text-xs sm:text-sm uppercase tracking-tighter">Kavya Boss Nutrition</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-relaxed">
                  Arjun Nagar, Near Patanjali Store, Agra, UP - 282001
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">Phone: +91 63975 16655</p>
              </div>
              <div className="text-left xs:text-right w-full xs:w-auto">
                <p className="font-bold text-xs sm:text-sm">INVOICE</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono">
                  #INV-{order.id.substring(order.id.length - 8).toUpperCase()}
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className={`p-2.5 sm:p-3 rounded-xl border ${
              isCOD
                ? "bg-orange-500/5 border-orange-500/20"
                : "bg-green-500/5 border-green-500/20"
            }`}>
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0 ${
                    isCOD ? "bg-orange-500" : "bg-green-500"
                  }`} />
                  <div>
                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${
                      isCOD ? "text-orange-500" : "text-green-500"
                    }`}>
                      {isCOD ? "To Be Paid" : "Paid"}
                    </p>
                    <p className="text-[11px] sm:text-sm font-bold mt-0.5">
                      {isCOD ? "Cash on Delivery" : "Razorpay Online Payment"}
                    </p>
                  </div>
                </div>
                {!isCOD && order.paymentId && (
                  <div className="text-left xs:text-right w-full xs:w-auto">
                    <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Txn ID</p>
                    <p className="text-[8px] sm:text-[9px] font-mono text-muted-foreground select-all break-all">
                      {order.paymentId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-muted-foreground/10" />

            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Bill To:</p>
              <p className="font-bold text-xs sm:text-sm">{order.address.name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                {order.address.line1}
                {order.address.line2 && <>, {order.address.line2}</>}
                <br />{order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Phone: {order.address.phone}</p>
            </div>

            <Separator className="bg-muted-foreground/10" />

            <div className="space-y-1.5 sm:space-y-2">
              <p className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Items:</p>
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-2 sm:gap-4 text-[11px] sm:text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{item.product.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-bold shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <Separator className="bg-muted-foreground/10" />

            <div className="space-y-1 sm:space-y-1.5 text-right font-medium text-[11px] sm:text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {(toNum(order.discountAmount) ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount{order.discountCode ? ` (${order.discountCode})` : ''}
                  </span>
                  <span>-₹{(toNum(order.discountAmount) ?? 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-normal text-[9px] sm:text-[10px]">
                <span>CGST (9%)</span>
                <span>₹{Math.round(cgst).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-normal text-[9px] sm:text-[10px]">
                <span>SGST (9%)</span>
                <span>₹{Math.round(sgst).toLocaleString()}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between items-baseline font-black text-xs sm:text-sm">
                <span className="uppercase">{isCOD ? "Total (Pay on Delivery)" : "Total Paid"}</span>
                <span className={`text-sm sm:text-base ${isCOD ? "text-orange-500" : "text-brand"}`}>
                  ₹{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDownloading}
              className="w-full sm:flex-1 font-bold h-11 sm:h-12 rounded-2xl border-muted-foreground/20 hover:bg-muted text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="w-full sm:flex-1 font-black uppercase text-xs tracking-widest h-11 sm:h-12 bg-brand text-black hover:bg-brand/90 rounded-2xl shadow-[0_0_20px_rgba(0,255,135,0.25)]"
            >
              {isDownloading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  Download Invoice
                </span>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
