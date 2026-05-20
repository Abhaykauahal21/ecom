"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Loader2, X, Receipt } from "lucide-react";
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

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!order) return null;

  const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const baseAmount = subtotal / 1.18;
  const totalGst = subtotal - baseAmount;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Small timeout to allow UI update / loader
      await new Promise((resolve) => setTimeout(resolve, 800));

      const doc = new jsPDF();
      
      // Set Document Properties
      doc.setProperties({
        title: `Invoice_${order.id}`,
        subject: 'Order Tax Invoice',
        author: 'Kavya Boss Nutrition',
      });

      // Brand Header
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

      // Invoice metadata (Right aligned)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("TAX INVOICE", 150, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(`Invoice No: INV-${order.id.substring(order.id.length - 8).toUpperCase()}`, 150, 26);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 31);
      doc.text(`Payment: ${order.paymentStatus || 'PAID'}`, 150, 36);

      // Separator Line
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 42, 196, 42);

      // Billing Information
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("BILL TO:", 14, 49);

      doc.setFont("helvetica", "normal");
      doc.text(order.address.name || 'Customer Name', 14, 54);
      doc.text(`Phone: ${order.address.phone}`, 14, 59);
      doc.text(order.address.line1, 14, 64);
      if (order.address.line2) {
        doc.text(order.address.line2, 14, 69);
      }
      doc.text(`${order.address.city}, ${order.address.state} - ${order.address.pincode}`, 14, 74);

      // Table of Items
      const tableRows = order.orderItems.map((item, index) => [
        index + 1,
        item.product.name,
        `INR ${item.price.toFixed(2)}`,
        item.quantity,
        `INR ${(item.price * item.quantity).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 82,
        head: [['#', 'Description', 'Unit Price', 'Qty', 'Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8.5, cellPadding: 4, font: 'helvetica' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 95 },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 35, halign: 'right' }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;

      // Summary Calculations
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Subtotal:", 130, finalY);
      doc.text(`INR ${subtotal.toFixed(2)}`, 196, finalY, { align: 'right' });

      doc.text("Shipping:", 130, finalY + 5);
      doc.text(order.shippingCost === 0 ? "FREE" : `INR ${order.shippingCost.toFixed(2)}`, 196, finalY + 5, { align: 'right' });

      doc.text("CGST (9% Included):", 130, finalY + 10);
      doc.text(`INR ${cgst.toFixed(2)}`, 196, finalY + 10, { align: 'right' });

      doc.text("SGST (9% Included):", 130, finalY + 15);
      doc.text(`INR ${sgst.toFixed(2)}`, 196, finalY + 15, { align: 'right' });

      // Final Total
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Total Amount Paid:", 130, finalY + 22);
      doc.text(`INR ${order.totalAmount.toFixed(2)}`, 196, finalY + 22, { align: 'right' });

      // Invoice Footer Note
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text("Thank you for your purchase! This is a digital tax invoice generated automatically.", 14, finalY + 36);

      doc.save(`invoice_${order.id.substring(order.id.length - 8).toUpperCase()}.pdf`);
      toast.success("Invoice downloaded successfully!");
      onClose();
    } catch (error) {
      console.error("[INVOICE_DOWNLOAD_ERROR]", error);
      toast.error("An error occurred while generating the invoice.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl border-none shadow-2xl bg-white/95 dark:bg-black/95 backdrop-blur-2xl p-6 rounded-3xl overflow-hidden">
        <DialogHeader className="space-y-2">
          <div className="mx-auto h-12 w-12 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-2">
            <Receipt className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase text-center tracking-tight">
            Download Invoice
          </DialogTitle>
          <DialogDescription className="text-center text-sm font-medium text-muted-foreground">
            Review the billing breakdown below before generating your PDF invoice.
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Preview Card */}
        <div className="my-4 bg-muted/40 p-5 rounded-2xl border border-muted text-xs space-y-4 max-h-72 overflow-y-auto">
          {/* Header metadata */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="font-black text-sm uppercase tracking-tighter">Kavya Boss Nutrition</p>
              <p className="text-[10px] text-muted-foreground">Arjun Nagar, Near Patanjali Store, Agra, UP - 282001</p>
              <p className="text-[10px] text-muted-foreground">Phone: +91 63975 16655 | GSTIN: 09AABCK1234M1Z5</p>
            </div>
            <div className="text-right">
              <p className="font-bold">INVOICE</p>
              <p className="text-[10px] text-muted-foreground">#INV-{order.id.substring(order.id.length - 8).toUpperCase()}</p>
            </div>
          </div>

          <Separator className="bg-muted-foreground/10" />

          {/* Billing Info */}
          <div>
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Bill To:</p>
            <p className="font-bold text-[13px]">{order.address.name}</p>
            <p className="text-muted-foreground">{order.address.line1}</p>
            {order.address.line2 && <p className="text-muted-foreground">{order.address.line2}</p>}
            <p className="text-muted-foreground">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
            <p className="text-muted-foreground">Phone: {order.address.phone}</p>
          </div>

          <Separator className="bg-muted-foreground/10" />

          {/* Order Items List */}
          <div className="space-y-2">
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] mb-1">Items Summary:</p>
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center gap-4 text-[11px]">
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{item.product.name}</p>
                  <p className="text-[10px] text-muted-foreground">Qty: {item.quantity} • Price: ₹{item.price.toLocaleString()}</p>
                </div>
                <p className="font-bold shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <Separator className="bg-muted-foreground/10" />

          {/* Calculations Summary */}
          <div className="space-y-1.5 text-right font-medium">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-normal text-[10px]">
              <span>CGST (9% Included)</span>
              <span>₹{Math.round(cgst).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-normal text-[10px]">
              <span>SGST (9% Included)</span>
              <span>₹{Math.round(sgst).toLocaleString()}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between items-baseline font-black text-sm">
              <span className="uppercase text-[11px]">Total Paid</span>
              <span className="text-brand text-base">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <DialogFooter className="flex sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDownloading}
            className="flex-1 font-bold h-11 rounded-2xl border-muted-foreground/20 hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 font-black uppercase text-xs tracking-widest h-11 bg-brand text-black hover:bg-brand/90 rounded-2xl shadow-[0_0_20px_rgba(0,255,135,0.25)]"
          >
            {isDownloading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Confirm & Download
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
