const { Resend } = require('resend');

async function sendTestEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: 'TheMechAssist <hola@themechassist.com>',
      to: ['marcosdadone96@gmail.com'],
      subject: 'Email de prueba desde Resend (TheMechAssist)',
      html: '<strong>¡Funciona!</strong> Este es un email de prueba enviado con la librería Resend y Node.js.'
    });

    console.log('Email enviado correctamente:', data);
  } catch (error) {
    console.error('Error al enviar el email:', error);
    process.exit(1);
  }
}

sendTestEmail();