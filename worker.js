addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const email = formData.get('email');
      const daily = formData.get('entry.1889021612') === 'Hebdomadaire';
      const weekly = formData.get('entry.1185604264') === 'Quotidien';

      if (validateEmail(email)) {
        // Store in KV with preferences
        await SUBSCRIBERS.put(email, JSON.stringify({
          date: new Date().toISOString(),
          preferences: {
            daily,
            weekly
          }
        }));
        
        // Send to Google Forms
        try {
          const googleFormsData = new FormData();
          googleFormsData.append('entry.1899983470', email);
          googleFormsData.append('entry.1889021612', daily ? 'Hebdomadaire' : '');
          googleFormsData.append('entry.1185604264', weekly ? 'Quotidien' : '');

          await fetch(
            'https://docs.google.com/forms/d/e/1FAIpQLScwTlYGX16DQDtjtXfE_uHlCQ5hJ7y6vHvVUNPEhr-RZ6k-xQ/formResponse',
            {
              method: 'POST',
              body: googleFormsData,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );
        } catch (googleError) {
          console.error('Google Forms error:', googleError);
        }
        
        // Send confirmation email
        await sendConfirmationEmail(email, { daily, weekly });
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Merci ! Tu recevras bientôt nos nouvelles.'
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Adresse email invalide.'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Erreur du serveur'
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
  }

  return new Response(getHTML(), {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}

async function sendConfirmationEmail(toEmail, preferences) {
  const frequencyText = preferences.daily && preferences.weekly ? 
    'quotidienne et hebdomadaire' : 
    preferences.daily ? 'quotidienne' : 
    preferences.weekly ? 'hebdomadaire' : 'personnalisée';

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
        email: 'hmb05092006@gmail.com',
        name: 'Hans Mbaya Newsletter'
      },
      subject: "Confirmation d'abonnement à la Newsletter HMB-TECH",
      content: [{
        type: 'text/html',
        value: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0D1C40; text-align: center;">Merci pour ton inscription !</h1>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
              Salut,<br><br>
              Merci de t'être inscrit(e) à la newsletter HMB-TECH avec une fréquence ${frequencyText}.
              Tu recevras bientôt nos actualités et nos meilleurs conseils !
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                Pour te désabonner, réponds simplement à cet email avec "Désabonnement" en objet.
              </p>
            </div>
          </div>
        `
      }],
    }),
  });

  try {
    const response = await fetch(send_request);
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  } catch (e) {
    console.error('Failed to send email:', e);
    throw e;
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
    <link rel="icon" type="image/png" href="https://raw.githubusercontent.com/HansHugoHMB/HansHugoHMB/main/assets/Logo-circle.webp">
    <style>
        :root {
            --primary-color: #0D1C40;
            --accent-color: #FFD700;
            --text-color: white;
            --error-color: #ff4444;
            --success-color: #00C851;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        @keyframes check {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
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
            position: relative;
            overflow: hidden;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
        }

        .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .btn-text {
            transition: opacity 0.3s ease;
        }

        .loader {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            border: 3px solid var(--primary-color);
            border-top-color: transparent;
            border-radius: 50%;
            opacity: 0;
            display: none;
            animation: spin 1s linear infinite;
        }

        .submit-btn.loading .btn-text {
            opacity: 0;
        }

        .submit-btn.loading .loader {
            opacity: 1;
            display: block;
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

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .notification.success {
            background-color: var(--success-color);
        }

        .notification.error {
            background-color: var(--error-color);
        }

        .notification.show {
            transform: translateX(0);
        }
    </style>
</head>
<body>
    <div class="newsletter-card">
        <h2 class="newsletter-title">
            <svg viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            NEWSLETTER HMB-TECH
        </h2>

        <form id="newsletter-form">
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
            <button type="submit" class="submit-btn" id="submit-button">
                <span class="btn-text">S'abonner</span>
                <div class="loader"></div>
            </button>
        </form>
    </div>

    <div class="copyright">
        © 2025 HMB-TECH –·– TOUS DROITS RÉSERVÉS
    </div>

    <script>
        const newsletterForm = document.getElementById('newsletter-form');
        const emailInput = document.getElementById('email');
        const submitButton = document.getElementById('submit-button');

        function showNotification(message, type) {
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            const notification = document.createElement('div');
            notification.className = \`notification \${type}\`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Force a reflow
            notification.offsetHeight;
            
            // Show the notification
            setTimeout(() => notification.classList.add('show'), 10);
            
            // Remove the notification after 3 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        newsletterForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const formData = new FormData(this);
            
            // Show loading state
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            try {
                const response = await fetch('', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    showNotification(data.message, 'success');
                    emailInput.value = '';
                    
                    // Reset checkboxes to checked state
                    document.getElementById('daily').checked = true;
                    document.getElementById('weekly').checked = true;
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                console.error('Erreur:', error);
                showNotification('Une erreur est survenue lors de la connexion au serveur', 'error');
            } finally {
                // Remove loading state
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        });
    </script>
</body>
</html>`;
}