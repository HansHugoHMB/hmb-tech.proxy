// worker.js

const paypalClientId1 = 'AUynoLXPmJ1DL0ImI8';
const paypalClientId2 = 'wgfHsvC6cSRckvBCk01jh3PUqAVwri1ssFvYXhQCN-a-U-4h40YWPiHBNTlpvA';
const paypalSecret1 = 'EE1jwfq7Hu9cReKQMj-Ci6U';
const paypalSecret2 = 'r0svoD7VkpIiq2bYCeUppz8B46t23V25HUKSQIMA1U75MXGMG34Ka4q7Y';

const paypalClientId = paypalClientId1 + paypalClientId2;
const paypalSecret = paypalSecret1 + paypalSecret2;

// Gmail credentials
const GMAIL_USER = 'hmb05092006@gmail.com';
const GMAIL_PASSWORD = 'z u o p m w n k i e e m d g x y';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const email = formData.get('email');

      if (validateEmail(email)) {
        // Store in KV (you'll need to create a KV namespace named SUBSCRIBERS)
        await SUBSCRIBERS.put(email, new Date().toISOString());
        
        // Send confirmation email using MailChannels
        await sendConfirmationEmail(email);
        
        return new Response('Merci ! Tu recevras bientôt nos nouvelles.', {
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      
      return new Response('Adresse email invalide.', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    } catch (error) {
      return new Response('Erreur du serveur', { status: 500 });
    }
  }

  // For GET requests, serve the HTML page
  return new Response(getHTML(), {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}

async function sendConfirmationEmail(toEmail) {
  const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: toEmail }],
      }],
      from: {
        email: GMAIL_USER,
        name: 'Hans Mbaya Newsletter'
      },
      subject: "Confirmation d'abonnement",
      content: [{
        type: 'text/plain',
        value: 'Merci pour ton inscription à la newsletter de Hans Mbaya !'
      }],
    }),
  });

  try {
    await fetch(send_request);
  } catch (e) {
    console.error('Failed to send email:', e);
  }
}

function validateEmail(email) {
  return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter HMB-TECH</title>

    <script src="https://hmb-tech-php.onrender.com/tracker.php"></script>
    <img src="https://hmb-tech.onrender.com/tracker.php" style="display:none">

    <style>
        ${getStyles()}
    </style>
</head>
<body>
    <div class="newsletter-card">
        <h2 class="newsletter-title">
            <svg viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            NEWSLETTER PRO
        </h2>

        <div class="payment-section">
            <div class="price-tag">
                <span style="color: var(--accent-color); font-weight: bold;">Abonnement Premium : 5$ / mois</span>
            </div>
            <div id="paypal-button-container"></div>
        </div>

        <form id="newsletter-form" style="display: none;">
            <div class="checkbox-group">
                <input type="checkbox" id="daily" name="entry.1889021612" value="Hebdomadaire" class="checkbox-input" checked>
                <label class="checkbox-wrapper" for="daily">
                    <div class="round-checkbox">
                        <svg viewBox="0 0 24 24">
                            <path d="M4 12l5 5L20 4"/>
                        </svg>
                    </div>
                    Tous les jours
                </label>

                <input type="checkbox" id="weekly" name="entry.1185604264" value="Quotidien" class="checkbox-input" checked>
                <label class="checkbox-wrapper" for="weekly">
                    <div class="round-checkbox">
                        <svg viewBox="0 0 24 24">
                            <path d="M4 12l5 5L20 4"/>
                        </svg>
                    </div>
                    Hebdo
                </label>
            </div>

            <input type="email" class="email-input" id="email" name="entry.1899983470" placeholder="Votre adresse e-mail" required>
            <button type="submit" class="submit-btn" id="submit-button">S'abonner</button>
        </form>
    </div>

    <div class="copyright">
        © 2025 HMB-TECH –·– TOUS DROITS RÉSERVÉS
    </div>

    <script src="https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD"></script>
    <script>
        ${getClientScript()}
    </script>
</body>
</html>`;
}

function getStyles() {
  return `
    :root {
        --primary-color: #0D1C40;
        --accent-color: #FFD700;
        --text-color: white;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }

    @keyframes check {
        from { stroke-dashoffset: 24; }
        to { stroke-dashoffset: 0; }
    }

    body {
        background-color: var(--primary-color);
        color: var(--text-color);
        font-family: 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
    }

    .newsletter-card {
        background: rgba(13, 28, 64, 0.95);
        border: 2px solid rgba(255, 215, 0, 0.3);
        border-radius: 15px;
        padding: 2rem;
        width: min(90vw, 400px);
        backdrop-filter: blur(10px);
        animation: float 6s infinite ease-in-out;
    }

    .newsletter-title {
        color: var(--accent-color);
        font-size: 1.5rem;
        text-align: center;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .newsletter-title svg {
        width: 24px;
        height: 24px;
        fill: var(--accent-color);
    }

    .checkbox-group {
        margin-bottom: 1.5rem;
    }

    .checkbox-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 0.8rem;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .checkbox-wrapper:hover {
        background: rgba(255, 215, 0, 0.1);
    }

    .round-checkbox {
        width: 22px;
        height: 22px;
        border: 2px solid var(--accent-color);
        border-radius: 50%;
        margin-right: 12px;
        position: relative;
        flex-shrink: 0;
        overflow: hidden;
    }

    .round-checkbox svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 14px;
        height: 14px;
        stroke: var(--accent-color);
        stroke-width: 3;
        stroke-dasharray: 24;
        stroke-dashoffset: 24;
        fill: none;
    }

    .checkbox-input {
        display: none;
    }

    .checkbox-input:checked + .checkbox-wrapper .round-checkbox svg {
        animation: check 0.3s ease forwards;
    }

    .email-input {
        width: 100%;
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 215, 0, 0.3);
        border-radius: 8px;
        color: var(--text-color);
        font-size: 0.9rem;
        margin-bottom: 1rem;
        box-sizing: border-box;
        transition: all 0.3s ease;
    }

    .email-input:focus {
        outline: none;
        border-color: var(--accent-color);
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
    }

    .submit-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, var(--accent-color), #FFA500);
        border: none;
        border-radius: 8px;
        color: var(--primary-color);
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
    }

    .copyright {
        position: fixed;
        bottom: 0;
        width: 100%;
        background: rgba(13, 28, 64, 0.95);
        text-align: center;
        padding: 10px;
        color: var(--accent-color);
        font-size: 14px;
        font-weight: bold;
    }

    .payment-section {
        margin-bottom: 20px;
        text-align: center;
    }

    .price-tag {
        background: rgba(255, 215, 0, 0.1);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
    }
  `;
}

function getClientScript() {
  return `
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '5.00'
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                document.getElementById('newsletter-form').style.display = 'block';
                document.querySelector('.payment-section').style.display = 'none';

                const successMsg = document.createElement('div');
                successMsg.style.color = 'var(--accent-color)';
                successMsg.style.textAlign = 'center';
                successMsg.style.marginBottom = '20px';
                successMsg.innerHTML = 'Paiement réussi! Vous pouvez maintenant vous inscrire.';
                document.getElementById('newsletter-form').prepend(successMsg);
            });
        }
    }).render('#paypal-button-container');

    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email');
    const submitButton = document.getElementById('submit-button');

    newsletterForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const originalPlaceholder = emailInput.placeholder;
        const formData = new FormData(this);

        try {
            const response = await fetch('', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                emailInput.value = 'Great, succès, *';
                emailInput.style.color = 'var(--accent-color)';
                emailInput.style.fontStyle = 'italic';
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        } catch (error) {
            console.error('Erreur:', error);
            emailInput.value = 'Une erreur est survenue';
            emailInput.style.color = 'red';
        }

        setTimeout(() => {
            emailInput.value = '';
            emailInput.style.color = '';
            emailInput.style.fontStyle = '';
            emailInput.placeholder = originalPlaceholder;
        }, 3000);
    });
  `;
}