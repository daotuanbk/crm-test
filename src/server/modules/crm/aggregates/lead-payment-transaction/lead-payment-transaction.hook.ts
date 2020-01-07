import { Hook, addCreationInfo, addModificationInfo, logApiRequest, authenticate, createTransactionJob , CREATE_TRANSACTION_TEMPLATE, FULL_TUITION_TEMPLATE,
  ACTION_TYPE_TUITION_TRANSACTION } from '@app/core';
import { leadPaymentTransactionRepository , leadRepository, emailTemplateConfigRepository, leadHistoryRepository } from '@app/crm';

const checkAutoMail = async (context: any) => {
  const data = context.data;
  if (data && data.leadId && data.sendAutoMail) {
    const lead = await leadRepository.findById(data.leadId) as any;
    const templateConfig = await emailTemplateConfigRepository.findByName(CREATE_TRANSACTION_TEMPLATE) as any;
    if (templateConfig.data && templateConfig.data.length) {
      const promises = templateConfig.data.map((templateConf: any) => {
        const template = templateConf ? templateConf.template : undefined;
        if (template && template.text && template.subject && lead) {
          const rec = templateConf.recipient || '';
          let recipient = '';
          if (rec === 'student') {
            recipient = lead.contact ? lead.contact.email : '';
          } else if (rec === 'saleman') {
            recipient = lead.owner && lead.owner.id ? lead.owner.id.email : '';
          }
          const html = data.html && recipient && data.html[recipient] ? data.html[recipient] :
            template.text.replace(/@student_name/g, lead.contact ? lead.contact.fullName || '' : '')
            .replace(/@transaction_type/g, data.paymentType)
            .replace(/@transaction_amount/g, `${Number(data.amount).toLocaleString()} VND`);
          const subject = data.subject && recipient && data.subject[recipient] ? data.subject[recipient] : template.subject.replace(/@student_name/g, lead.contact ? lead.contact.fullName || '' : '')
            .replace(/@transaction_type/g, data.paymentType)
            .replace(/@transaction_amount/g, `${Number(data.amount).toLocaleString()} VND`);
          if (recipient) {
            return createTransactionJob({
              recipient,
              subject,
              html,
            });
          } else {
            return null;
          }
        } else {
          return null;
        }
      });
      await Promise.all(promises);
    }

    // Full tuition email
    if (lead) {
      const tuitionAD = lead.tuition ? lead.tuition.totalAfterDiscount : undefined;
      if (tuitionAD !== undefined) {
        const allTransactions = await leadPaymentTransactionRepository.find({leadId: data.leadId} as any);
        const deepClones = JSON.parse(JSON.stringify(allTransactions));
        const totalPayment = deepClones.reduce((sum: number, val: any) => sum + val.amount || 0, 0);
        if (Number(totalPayment) >= Number (tuitionAD)) {
          const config = await emailTemplateConfigRepository.findByName(FULL_TUITION_TEMPLATE) as any;
          if (config) {
            const deepCloneConfig = JSON.parse(JSON.stringify(config));
            if (deepCloneConfig && deepCloneConfig.data && deepCloneConfig.data.length) {
              const promises = deepCloneConfig.data.map((templateConf: any) => {
                const template = templateConf ? templateConf.template : undefined;
                if (template && template.text) {
                  const html =
                    template.text.replace(/@student_name/g, lead.contact ? lead.contact.fullName || '' : '')
                    .replace(/@total_ad/g, `${Number(tuitionAD).toLocaleString()} VND`)
                    .replace(/@total_payment/g, `${Number(totalPayment).toLocaleString()} VND`);
                  const rec = templateConf.recipient || '';
                  const subject = templateConf.subject;
                  let recipient = '';
                  if (rec === 'student') {
                    recipient = lead.contact ? lead.contact.email : '';
                  } else if (rec === 'saleman') {
                    recipient = lead.owner && lead.owner.id ? lead.owner.id.email : '';
                  }
                  if (recipient) {
                    return createTransactionJob({
                      recipient,
                      subject,
                      html,
                    });
                  } else {
                    return null;
                  }
                } else {
                  return null;
                }
              });
              await Promise.all(promises);
            }
          }
        }
      }
    }
  }
};

const historyLogging = async (context: any) => {
  const data = context.data;
  if (data && data.leadId) {
    const lead = await leadRepository.findById(data.leadId) as any;
    if (lead) {
      await leadHistoryRepository.create({
        actionType: ACTION_TYPE_TUITION_TRANSACTION,
        actionCreatedBy: {
          _id: context.params.authUser ? context.params.authUser._id : undefined,
          name: context.params.authUser ? context.params.authUser.fullName : undefined,
        },
        actionCreatedWhen: Date.now(),
        leadId: lead._id,
        name: lead.contact ? lead.contact.fullName : '',
        currentCentre: lead.centre ? {
          _id: lead.centre._id,
          name: lead.centre.name,
        } : undefined,
        currentStage: lead.currentStage,
        currentStatus: lead.currentStatus,
        currentOwner: lead.owner ? {
          _id: lead.owner.id ? lead.owner.id._id : undefined,
          name: lead.owner.fullName,
        } : undefined,
        transaction: {
          paymentType: data.paymentType,
          amount: data.amount,
          note: data.note,
          payDay: data.payDay || Date.now(),
        },
      } as any);
    }
  }
};

const leadPaymentTransactionHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = leadPaymentTransactionRepository;
      },
    ],
    create: [
      addCreationInfo,
      historyLogging,
    ],
    patch: [
      addModificationInfo,
    ],
  },
  after: {
    create: [
      checkAutoMail,
    ],
  },
};

export default leadPaymentTransactionHook;
