import { logger, transporter } from '@app/core';
import { config } from '@app/config';

const forwardRegistrationJob = async (data: any) => {
  const mailOptions = {
    from: config.emailAccount.reg.account,
    to: data.recipient,
    subject: data.subject,
    html: data.html,
  };

  await transporter.sendMail(mailOptions);
  logger.info(`[Web-Register : After Create] Send email success`);
};

export {
  forwardRegistrationJob,
};
