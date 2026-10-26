const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Endpoint de pago ($50 USD)
app.post('/api/checkout/agregar-fondos', async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Novalo - Recarga de Fondos / Plan Crédito',
              description: 'Optimización de crédito automatizada',
            },
            unit_amount: (amount || 50) * 100, // $50 USD
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId,
      success_url: 'https://novalo.app/dashboard?status=success',
      cancel_url: 'https://novalo.app/dashboard?status=cancel',
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook de confirmación de pago
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`[Pago Exitoso] $${session.amount_total / 100} acreditados.`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Novalo activo en puerto ${PORT}`));
