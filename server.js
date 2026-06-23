import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/create-payment-token', async (req, res) => {
  try {
    const { orderId, amount, customerName, email, phone } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('Server Key Midtrans tidak ditemukan di environment variables.');
      return res.status(500).json({ error: 'Server Key Midtrans belum dikonfigurasi.' });
    }

    // Auth Header: Basic base64(serverKey + ":")
    const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName || 'Pelanggan',
        email: email || 'customer@example.com',
        phone: phone || '081234567890',
      },
      enabled_payments: [
        'bca_va',
        'bni_va',
        'bri_va',
        'mandiri_clickpay',
        'permata_va',
        'other_va',
        'gopay',
        'shopeepay'
      ]
    };

    console.log('Sending payload to Midtrans:', JSON.stringify(payload));

    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Midtrans API Error:', data);
      return res.status(response.status).json({ error: data.error_messages || 'Gagal memproses transaksi di Midtrans' });
    }

    console.log('Midtrans Snap Response:', data);
    res.json({ token: data.token, redirect_url: data.redirect_url });

  } catch (error) {
    console.error('Error creating Midtrans transaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server Midtrans API berjalan di http://localhost:${PORT}`);
});
