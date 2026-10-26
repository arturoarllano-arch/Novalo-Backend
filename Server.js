const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

// Ruta de prueba para verificar que el servidor responde
app.get('/', (req, res) => {
  res.json({ status: 'Servidor Novalo Backend activo y operando 🚀' });
});

// Endpoint para procesar pagos con Stripe
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 1000, // Monto por defecto en centavos
      currency: currency || 'usd',
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor Novalo activo en puerto ${PORT}`);
});
