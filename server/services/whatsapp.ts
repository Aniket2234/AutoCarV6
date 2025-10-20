interface WhatsAppResponse {
  success: boolean;
  statusDesc?: string;
  statusCode?: number;
  data?: any;
  error?: string;
}

const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '919970127778';
const WHATSAPP_BASE_URL = 'https://cloudapi.akst.in/api/v1.0/messages';

function formatPhoneNumber(phone: string): string {
  let formattedPhone = phone.replace(/\D/g, '');
  
  if (formattedPhone.startsWith('0') && formattedPhone.length === 11) {
    formattedPhone = formattedPhone.substring(1);
  }
  
  if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
    return formattedPhone;
  }
  
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }
  
  if (formattedPhone.length !== 12 || !formattedPhone.startsWith('91')) {
    console.error(`⚠️ Invalid phone number format after normalization: "${formattedPhone}" (original: "${phone}")`);
    console.error('Expected format: 12 digits starting with 91 (e.g., 919876543210)');
  }
  
  return formattedPhone;
}

export async function sendWhatsAppOTP({ 
  to, 
  otp 
}: { 
  to: string; 
  otp: string;
}): Promise<WhatsAppResponse> {
  if (!WHATSAPP_API_KEY) {
    console.error('❌ WhatsApp API key not configured');
    return { success: false, error: 'WhatsApp credentials not configured' };
  }

  const formattedPhone = formatPhoneNumber(to);
  const message = `Following is the otp for mauli car world:- ${otp}`;

  const url = `${WHATSAPP_BASE_URL}/send-text/${WHATSAPP_PHONE_NUMBER_ID}`;
  
  console.log('\n📱 Sending WhatsApp OTP Message');
  console.log('================================');
  console.log('API URL:', url);
  console.log('API Key:', WHATSAPP_API_KEY.substring(0, 8) + '...');
  console.log('Channel Number:', WHATSAPP_PHONE_NUMBER_ID);
  console.log('To (Original):', to);
  console.log('To (Formatted):', formattedPhone);
  console.log('Message:', message);
  console.log('================================\n');

  try {
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      })
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    console.log(`\n✅ WhatsApp OTP Response (${responseTime}ms)`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('================================\n');

    if (data.success) {
      return { 
        success: true, 
        statusDesc: data.statusDesc,
        data: data.data 
      };
    } else {
      return { 
        success: false, 
        error: data.statusDesc || 'Failed to send WhatsApp message',
        statusCode: data.statusCode
      };
    }
  } catch (error) {
    console.error('❌ WhatsApp API Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send WhatsApp message'
    };
  }
}

export async function sendWhatsAppWelcome({ 
  to, 
  templateName,
  customerId
}: { 
  to: string; 
  templateName: string;
  customerId: string;
}): Promise<WhatsAppResponse> {
  if (!WHATSAPP_API_KEY) {
    console.error('❌ WhatsApp API key not configured');
    return { success: false, error: 'WhatsApp credentials not configured' };
  }

  const formattedPhone = formatPhoneNumber(to);
  const url = `${WHATSAPP_BASE_URL}/send-template/${WHATSAPP_PHONE_NUMBER_ID}`;
  
  console.log('\n📱 Sending WhatsApp Welcome Template');
  console.log('================================');
  console.log('API URL:', url);
  console.log('API Key:', WHATSAPP_API_KEY.substring(0, 8) + '...');
  console.log('Channel Number:', WHATSAPP_PHONE_NUMBER_ID);
  console.log('Template Name:', templateName);
  console.log('To (Original):', to);
  console.log('To (Formatted):', formattedPhone);
  console.log('Customer ID:', customerId);
  console.log('================================\n');

  try {
    const startTime = Date.now();
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: customerId
              }
            ]
          }
        ]
      }
    };

    console.log('Request Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    console.log(`\n✅ WhatsApp Welcome Response (${responseTime}ms)`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('================================\n');

    if (data.success) {
      return { 
        success: true, 
        statusDesc: data.statusDesc,
        data: data.data 
      };
    } else {
      return { 
        success: false, 
        error: data.statusDesc || 'Failed to send WhatsApp template',
        statusCode: data.statusCode
      };
    }
  } catch (error) {
    console.error('❌ WhatsApp Template API Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send WhatsApp template'
    };
  }
}
