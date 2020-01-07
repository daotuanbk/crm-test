import {
  Hook,
  addCreationInfo,
  addModificationInfo,
  logApiRequest,
  authenticate,
  getCurrentTimestampInMilliseconds,
  ACTION_TYPE_OWNER_ASSIGNMENT,
  ACTION_TYPE_CHANGE_STAGE_STATUS,
  ACTION_TYPE_CHANGE_CENTER_CLASS,
  BULK_OPERATION_ID,
} from '@app/core';
import {
  leadRepository,
  defaultTaskRepository,
  leadTaskRepository,
  leadHistoryRepository,
} from '@app/crm';

const A_SECOND = 1000;

// const addLeadTaskByDefaultLeadTask = async (context: any) => {
//   await createLeadDefaultTask(context.result.id, context.data.owner);
// };

export const createLeadDefaultTask = async (id: string, ownerId?: string) => {
  if (!id) {
    return;
  }
  const defaultTasks = await defaultTaskRepository.findAll();
  if (defaultTasks && defaultTasks.length) {
    const promises = [];
    for (const i in defaultTasks) {
      const defaultTask = defaultTasks[i];
      const schedule =
        parseInt(defaultTask.schedule.split('-')[0], 10) * A_SECOND * 60 * 60 * 24 +
        parseInt(defaultTask.schedule.split('-')[1], 10) * A_SECOND * 60 * 60 +
        parseInt(defaultTask.schedule.split('-')[2], 10) * A_SECOND * 60;
      const dueAt = new Date(getCurrentTimestampInMilliseconds() + schedule);
      const leadTask = {
        leadId: '' + id,
        title: defaultTask.name,
        dueAt,
        createdAt: getCurrentTimestampInMilliseconds(),
        assigneeId: ownerId,
      };
      promises.push(leadTaskRepository.create(leadTask as any));
    }
    await Promise.all(promises);
  }
};

// const updateLeadConversation = async (context: any) => {
//   const { id = '' } = context.result;
//   const lead = await leadRepository.findById(id);
//   await leadConversationRepository.updateLeadId(lead.contact._id, id);
//   await leadAttachmentRepository.updateLeadId(lead.contact._id, id);
// };

const historyLogging = async (context: any) => {
  const data = context.data.payload;
  const operation = context.data.operation;

  if (context.id !== BULK_OPERATION_ID) {
    const lead = await leadRepository.findById(context.id);

    if (operation === 'updateDetail') {
      if (lead) {
        // Stage / Status changing
        if (data.currentStage && lead.currentStage !== data.currentStage) {
          // Create lead-history type stage
          await leadHistoryRepository.create({
            actionType: ACTION_TYPE_CHANGE_STAGE_STATUS,
            actionCreatedBy: {
              _id: context.params.authUser ? context.params.authUser._id : undefined,
              name: context.params.authUser ? context.params.authUser.fullName : undefined,
            },
            actionCreatedWhen: Date.now(),
            leadId: context.id,
            name: lead.contact ? lead.contact.fullName : '',
            currentCentre: lead.centre ? {
              _id: lead.centre._id,
              name: lead.centre.name,
            } : undefined,
            currentStage: lead.currentStage,
            currentStatus: lead.currentStatus,
            currentOwner: lead.owner ? {
              _id: lead.owner.id,
              name: lead.owner.fullName,
            } : undefined,
            fromStage: lead.currentStage,
            toStage: data.currentStage,
          } as any);
        }
        if (data.currentStatus && lead.currentStatus !== data.currentStatus) {
          await leadHistoryRepository.create({
            actionType: ACTION_TYPE_CHANGE_STAGE_STATUS,
            actionCreatedBy: {
              _id: context.params.authUser ? context.params.authUser._id : undefined,
              name: context.params.authUser ? context.params.authUser.fullName : undefined,
            },
            actionCreatedWhen: Date.now(),
            leadId: context.id,
            name: lead.contact ? lead.contact.fullName : '',
            currentCentre: lead.centre ? {
              _id: lead.centre._id,
              name: lead.centre.name,
            } : undefined,
            currentStage: lead.currentStage,
            currentStatus: lead.currentStatus,
            currentOwner: lead.owner ? {
              _id: lead.owner.id,
              name: lead.owner.fullName,
            } : undefined,
            fromStatus: lead.currentStatus,
            toStatus: data.currentStatus,
          } as any);
        }
        if (data.centre && (!lead.centre || (lead.centre && lead.centre._id !== data.centre._id))) {
          // Create lead-history type centre
          await leadHistoryRepository.create({
            actionType: ACTION_TYPE_CHANGE_CENTER_CLASS,
            actionCreatedBy: {
              _id: context.params.authUser ? context.params.authUser._id : undefined,
              name: context.params.authUser ? context.params.authUser.fullName : undefined,
            },
            actionCreatedWhen: Date.now(),
            leadId: context.id,
            name: lead.contact ? lead.contact.fullName : '',
            currentCentre: lead.centre ? {
              _id: lead.centre._id,
              name: lead.centre.name,
            } : undefined,
            currentStage: lead.currentStage,
            currentStatus: lead.currentStatus,
            currentOwner: lead.owner ? {
              _id: lead.owner.id,
              name: lead.owner.fullName,
            } : undefined,
            fromCentre: lead.centre ? {
              _id: lead.centre._id,
              name: lead.centre.name,
            } : undefined,
            toCentre: data.centre ? {
              _id: data.centre._id,
              name: data.centre.name,
            } : undefined,
          } as any);
        }
        if (data.owner && (!lead.owner || (lead.owner && lead.owner.id !== data.owner._id))) {
          // Create lead-history type owner
          await leadHistoryRepository.create({
            actionType: ACTION_TYPE_OWNER_ASSIGNMENT,
            actionCreatedBy: {
              _id: context.params.authUser ? context.params.authUser._id : undefined,
              name: context.params.authUser ? context.params.authUser.fullName : undefined,
            },
            actionCreatedWhen: Date.now(),
            leadId: context.id,
            name: lead.contact ? lead.contact.fullName : '',
            currentCentre: lead.centre ? {
              _id: lead.centre._id,
              name: lead.centre.name,
            } : undefined,
            currentStage: lead.currentStage,
            currentStatus: lead.currentStatus,
            currentOwner: lead.owner ? {
              _id: lead.owner.id,
              name: lead.owner.fullName,
            } : undefined,
            fromOwner: lead.owner ? {
              _id: lead.owner.id,
              name: lead.owner.fullName,
            } : undefined,
            toOwner: data.owner ? {
              _id: data.owner.id,
              name: data.owner.fullName,
            } : undefined,
          } as any);
        }
      }
    }
  }
};

const leadsHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = leadRepository;
      },
    ],
    create: [
      addCreationInfo,
      addModificationInfo,
    ],
    patch: [
      addModificationInfo,
    ],
  },
  after: {
    create: [
      // addLeadTaskByDefaultLeadTask,
      // updateLeadConversation,
    ],
    patch: [
      historyLogging,
    ],
  },
};

export default leadsHook;
