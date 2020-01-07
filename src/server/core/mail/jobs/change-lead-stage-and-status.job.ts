import { logger, transporter } from '@app/core';

const changeLeadStageAndStatusJob = async (data: any) => {
  const mailOptions = {
    from: 'contact@mindx.edu.vn',
    to: data.recipient,
    subject: data.subject,
    html: data.html,
  };
  await transporter.sendMail(mailOptions);
  logger.info(`[LeadStage&Status : After Update] Send email success`);
};

export {
  changeLeadStageAndStatusJob,
};
