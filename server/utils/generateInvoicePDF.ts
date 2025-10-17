import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
  invoiceNumber: string;
  createdAt: Date;
  dueDate?: Date;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleReg?: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount?: number;
  dueAmount: number;
  notes?: string;
  terms?: string;
}

export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfDir = path.join(process.cwd(), 'invoices');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const filename = `invoice_${invoiceData.invoiceNumber.replace(/\//g, '_')}.pdf`;
      const filepath = path.join(pdfDir, filename);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      doc.fontSize(20).font('Helvetica-Bold').text('Mauli Car World', 50, 50);
      doc.fontSize(10).font('Helvetica').text('Invoice', 50, 75);

      doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(10).font('Helvetica').text(invoiceData.invoiceNumber, 400, 75, { align: 'right' });

      let yPosition = 120;

      doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, yPosition);
      yPosition += 20;
      doc.fontSize(10).font('Helvetica').text(invoiceData.customerName, 50, yPosition);
      if (invoiceData.customerEmail) {
        yPosition += 15;
        doc.text(invoiceData.customerEmail, 50, yPosition);
      }
      if (invoiceData.customerPhone) {
        yPosition += 15;
        doc.text(invoiceData.customerPhone, 50, yPosition);
      }
      if (invoiceData.vehicleReg) {
        yPosition += 15;
        doc.font('Helvetica-Bold').text('Vehicle: ', 50, yPosition, { continued: true });
        doc.font('Helvetica').text(invoiceData.vehicleReg);
      }

      const invoiceDate = new Date(invoiceData.createdAt).toLocaleDateString();
      doc.fontSize(10).font('Helvetica-Bold').text('Invoice Date:', 400, 120, { align: 'right' });
      doc.font('Helvetica').text(invoiceDate, 400, 135, { align: 'right' });

      if (invoiceData.dueDate) {
        const dueDate = new Date(invoiceData.dueDate).toLocaleDateString();
        doc.font('Helvetica-Bold').text('Due Date:', 400, 150, { align: 'right' });
        doc.font('Helvetica').text(dueDate, 400, 165, { align: 'right' });
      }

      yPosition = Math.max(yPosition + 40, 200);

      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 20;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Item', 50, yPosition);
      doc.text('Qty', 280, yPosition, { width: 50, align: 'right' });
      doc.text('Unit Price', 340, yPosition, { width: 80, align: 'right' });
      doc.text('Amount', 430, yPosition, { width: 100, align: 'right' });

      yPosition += 20;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 15;

      doc.font('Helvetica');
      invoiceData.items.forEach((item) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(10).text(item.name, 50, yPosition, { width: 220 });
        if (item.description) {
          yPosition += 12;
          doc.fontSize(8).fillColor('#666').text(item.description, 50, yPosition, { width: 220 });
          doc.fillColor('#000');
        }

        const itemYPosition = yPosition;
        doc.fontSize(10).text(item.quantity.toString(), 280, itemYPosition, { width: 50, align: 'right' });
        doc.text(`₹${item.unitPrice.toFixed(2)}`, 340, itemYPosition, { width: 80, align: 'right' });
        doc.text(`₹${item.total.toFixed(2)}`, 430, itemYPosition, { width: 100, align: 'right' });

        yPosition += 25;
      });

      yPosition += 10;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 20;

      doc.fontSize(10).font('Helvetica');
      doc.text('Subtotal:', 350, yPosition);
      doc.text(`₹${invoiceData.subtotal.toFixed(2)}`, 430, yPosition, { width: 100, align: 'right' });
      yPosition += 20;

      if (invoiceData.discountAmount && invoiceData.discountAmount > 0) {
        let discountText = 'Discount:';
        if (invoiceData.discountType === 'percentage' && invoiceData.discountValue) {
          discountText = `Discount (${invoiceData.discountValue}%):`;
        }
        doc.text(discountText, 350, yPosition);
        doc.text(`-₹${invoiceData.discountAmount.toFixed(2)}`, 430, yPosition, { width: 100, align: 'right' });
        yPosition += 20;
      }

      doc.text(`Tax (${invoiceData.taxRate}%):`, 350, yPosition);
      doc.text(`₹${invoiceData.taxAmount.toFixed(2)}`, 430, yPosition, { width: 100, align: 'right' });
      yPosition += 20;

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total Amount:', 350, yPosition);
      doc.text(`₹${invoiceData.totalAmount.toFixed(2)}`, 430, yPosition, { width: 100, align: 'right' });
      yPosition += 25;

      if (invoiceData.paidAmount && invoiceData.paidAmount > 0) {
        doc.fontSize(10).font('Helvetica');
        doc.text('Paid Amount:', 350, yPosition);
        doc.text(`₹${invoiceData.paidAmount.toFixed(2)}`, 430, yPosition, { width: 100, align: 'right' });
        yPosition += 20;

        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Amount Due:', 350, yPosition);
        doc.text(`₹${invoiceData.dueAmount.toFixed(2)}`, 430, yPosition, { width: 100, align: 'right' });
        yPosition += 25;
      }

      if (invoiceData.notes) {
        yPosition += 20;
        doc.fontSize(10).font('Helvetica-Bold').text('Notes:', 50, yPosition);
        yPosition += 15;
        doc.fontSize(9).font('Helvetica').text(invoiceData.notes, 50, yPosition, { width: 500 });
        yPosition += 40;
      }

      if (invoiceData.terms) {
        if (yPosition > 650) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(10).font('Helvetica-Bold').text('Terms & Conditions:', 50, yPosition);
        yPosition += 15;
        doc.fontSize(9).font('Helvetica').text(invoiceData.terms, 50, yPosition, { width: 500 });
      }

      doc.end();

      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}
