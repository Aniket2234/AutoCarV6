import { Invoice } from '../models/Invoice';

interface NotificationData {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  invoiceNumber: string;
  totalAmount: number;
  invoiceUrl?: string;
  pdfUrl?: string;
}

export async function sendInvoiceEmail(data: NotificationData): Promise<boolean> {
  try {
    console.log('📧 [STUB] Sending invoice email...');
    console.log('   To:', data.customerEmail);
    console.log('   Invoice:', data.invoiceNumber);
    console.log('   Amount: ₹', data.totalAmount);
    console.log('   PDF URL:', data.pdfUrl || 'Not generated');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('✅ [STUB] Email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ [STUB] Email sending failed:', error);
    return false;
  }
}

export async function sendInvoiceWhatsApp(data: NotificationData): Promise<boolean> {
  try {
    console.log('📱 [STUB] Sending invoice WhatsApp message...');
    console.log('   To:', data.customerPhone);
    console.log('   Message: Dear', data.customerName);
    console.log('   Invoice:', data.invoiceNumber);
    console.log('   Amount: ₹', data.totalAmount);
    console.log('   PDF URL:', data.pdfUrl || 'Not generated');
    
    const message = `Dear ${data.customerName},

Your invoice ${data.invoiceNumber} for ₹${data.totalAmount.toLocaleString()} has been generated.

${data.pdfUrl ? `Download PDF: ${data.pdfUrl}` : 'PDF will be sent shortly.'}

Thank you for your business!
- Mauli Car World`;

    console.log('   Full message:', message);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('✅ [STUB] WhatsApp message sent successfully');
    return true;
  } catch (error) {
    console.error('❌ [STUB] WhatsApp sending failed:', error);
    return false;
  }
}

export async function generateInvoicePDF(invoice: any): Promise<string> {
  try {
    console.log('📄 [STUB] Generating invoice PDF...');
    console.log('   Invoice:', invoice.invoiceNumber);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const pdfUrl = `/api/invoices/${invoice._id}/pdf`;
    console.log('✅ [STUB] PDF generated:', pdfUrl);
    
    return pdfUrl;
  } catch (error) {
    console.error('❌ [STUB] PDF generation failed:', error);
    return '';
  }
}

export async function sendInvoiceNotifications(invoice: any): Promise<void> {
  try {
    const pdfUrl = await generateInvoicePDF(invoice);
    
    const notificationData: NotificationData = {
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      pdfUrl,
    };

    const emailSent = invoice.customerEmail 
      ? await sendInvoiceEmail(notificationData)
      : false;

    const whatsappSent = invoice.customerPhone 
      ? await sendInvoiceWhatsApp(notificationData)
      : false;

    if (emailSent) {
      invoice.notificationsSent.email = true;
      invoice.notificationsSent.emailSentAt = new Date();
    }

    if (whatsappSent) {
      invoice.notificationsSent.whatsapp = true;
      invoice.notificationsSent.whatsappSentAt = new Date();
    }

    await invoice.save();

    console.log('📨 Notifications summary:');
    console.log('   Email:', emailSent ? '✅' : '❌');
    console.log('   WhatsApp:', whatsappSent ? '✅' : '❌');
  } catch (error) {
    console.error('❌ Failed to send invoice notifications:', error);
  }
}
