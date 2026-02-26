import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to, subject, html) {
  try {
    if (!to) {
      console.log('No email address provided, skipping email');
      return { success: false, reason: 'no_email' };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentConfirmation(student, payment) {
  const subject = 'Fee Payment Confirmation - Darun Nazat Madrasa';
  const html = `
    <h2>Payment Confirmation</h2>
    <p>Dear ${student.name},</p>
    <p>Your payment has been successfully received.</p>
    <h3>Payment Details:</h3>
    <ul>
      <li><strong>Transaction ID:</strong> ${payment.transaction_id}</li>
      <li><strong>Amount:</strong> ৳${payment.amount}</li>
      <li><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}</li>
      <li><strong>Fee Type:</strong> ${payment.fee_type}</li>
    </ul>
    <p>Thank you for your payment.</p>
    <p><strong>Darun Nazat Madrasa</strong><br>
    Kawla Zamindarbari, Dakshinkhan, Dhaka</p>
  `;

  return await sendEmail(student.email, subject, html);
}

export async function sendSalaryConfirmation(teacher, salary) {
  const subject = 'Salary Payment Confirmation - Darun Nazat Madrasa';
  const html = `
    <h2>Salary Payment Confirmation</h2>
    <p>Dear ${teacher.name},</p>
    <p>Your salary has been processed.</p>
    <h3>Payment Details:</h3>
    <ul>
      <li><strong>Transaction ID:</strong> ${salary.transaction_id}</li>
      <li><strong>Amount:</strong> ৳${salary.amount}</li>
      <li><strong>Month:</strong> ${salary.month}</li>
      <li><strong>Date:</strong> ${new Date(salary.date).toLocaleDateString()}</li>
    </ul>
    <p>Thank you for your service.</p>
    <p><strong>Darun Nazat Madrasa</strong><br>
    Kawla Zamindarbari, Dakshinkhan, Dhaka</p>
  `;

  return await sendEmail(teacher.email, subject, html);
}
