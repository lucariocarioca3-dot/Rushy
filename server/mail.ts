import nodemailer from "nodemailer";

// Configuração para o Ethereal (ambiente de teste) ou SMTP real se disponível
// Como não temos credenciais reais, usaremos o Ethereal para demonstração/teste
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'jessyca.gutmann55@ethereal.email', // Substituir por variáveis de ambiente em prod
    pass: 'K652z67WqX1G3fT4vB'
  }
});

export async function sendVerificationCode(email: string, code: string) {
  const mailOptions = {
    from: '"Rushy Sistema" <noreply@rushy.com>',
    to: email,
    subject: 'Seu código de verificação Rushy',
    text: `Seu código de verificação é: ${code}. Ele expira em 10 minutos.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Verificação de E-mail - Rushy</h2>
        <p>Olá! Você está tentando se cadastrar no Rushy.</p>
        <p>Use o código abaixo para confirmar seu e-mail:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #6b7280; font-size: 14px;">Este código expira em 10 minutos. Se você não solicitou este código, ignore este e-mail.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado: %s", info.messageId);
    // Em desenvolvimento, o link para visualizar o e-mail no Ethereal
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return false;
  }
}
