import { logger, transporter } from '@app/core';

const changeClassStageAndStatusJob = async (data: any) => {
  const mailOptions = {
    from: 'contact@mindx.edu.vn',
    to: data.recipient,
    subject: data.subject,
    html: data.html,
  };
  await transporter.sendMail(mailOptions);
  logger.info(`[ClassStage&Status : After Update] Send email success`);
};

export {
  changeClassStageAndStatusJob,
};
