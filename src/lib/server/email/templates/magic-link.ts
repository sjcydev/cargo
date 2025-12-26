/**
 * Plantillas de email para Magic Link
 * Email templates for Magic Link authentication
 */

/**
 * Generate HTML email template for magic link
 */
export function getMagicLinkEmailHTML(magicLink: string, companyName: string = 'Cargo Portal'): string {
	return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Enlace de Acceso</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    h1 {
      color: #111827;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 16px 0;
      text-align: center;
    }
    p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    .button {
      display: inline-block;
      background: #111827;
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }
    .button:hover {
      background: #1f2937;
    }
    .expiry {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .expiry p {
      color: #92400e;
      font-size: 14px;
      margin: 0;
    }
    .footer {
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
      margin-top: 32px;
    }
    .divider {
      border: 0;
      border-top: 1px solid #e5e7eb;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h2 style="color: #111827; margin: 0;">${companyName}</h2>
      </div>

      <h1>¡Bienvenido de vuelta!</h1>

      <p>
        Solicitaste un enlace de acceso para ingresar a tu portal de carga. Haz clic en el botón de abajo para iniciar sesión:
      </p>

      <a href="${magicLink}" class="button">
        Acceder a Mi Cuenta
      </a>

      <div class="expiry">
        <p>
          ⏱️ <strong>Este enlace expira en 15 minutos</strong> por tu seguridad.
        </p>
      </div>

      <hr class="divider" />

      <p style="font-size: 14px;">
        Si no solicitaste este enlace de acceso, puedes ignorar este correo de forma segura.
        No se ha realizado ningún cambio en tu cuenta.
      </p>

      <p style="font-size: 14px;">
        Por razones de seguridad, este enlace solo puede usarse una vez.
      </p>
    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} ${companyName}. Todos los derechos reservados.
      </p>
      <p>
        Este es un mensaje automático, por favor no responder.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text email template for magic link (for accessibility)
 */
export function getMagicLinkEmailText(magicLink: string, companyName: string = 'Cargo Portal'): string {
	return `
¡Bienvenido de vuelta!

Solicitaste un enlace de acceso para ingresar a tu portal de carga.

Haz clic aquí para iniciar sesión:
${magicLink}

Este enlace expira en 15 minutos por tu seguridad.

Si no solicitaste este enlace de acceso, puedes ignorar este correo de forma segura.
No se ha realizado ningún cambio en tu cuenta.

Por razones de seguridad, este enlace solo puede usarse una vez.

---
© ${new Date().getFullYear()} ${companyName}. Todos los derechos reservados.
Este es un mensaje automático, por favor no responder.
  `;
}
