import { logger, transporter } from '@app/core';

const createTransactionJob = async (data: any) => {
  const mailOptions = {
    from: 'contact@mindx.edu.vn',
    to: data.recipient,
    subject: data.subject,
    html: data.html,
  };
  await transporter.sendMail(mailOptions);
  logger.info(`[LeadTransaction : After Create] Send email success`);
};

export {
  createTransactionJob,
};
