import { EntityNotFoundError } from '@app/core';
import { leadRepository, centreRepository } from '@app/crm';
import { userRepository } from '@app/auth';
import _ from 'lodash';

interface Changer {
  permissions: string[];
  id: string;
  centreId: string;
}

interface LocalLead {
  _id: string;
  ownerId?: string;
  centreId?: string;
  owner?: {
    id: string;
    fullName?: string;
    avatar?: string;
  };
}

interface Receiver {
  isSaleHO: boolean;
  isGM: boolean;
  fullName?: string;
  avatarUrl?: string;
  centreId: string;
  isAuthUser: boolean;
}

interface Permission {
  ownershipScope: string;
  centreScope: string;
  receiverRoleScope: string;
  receiverCentreScope: string;
}

function decode(permString: string): Permission {
  const permParts = permString
    .toUpperCase()
    .replace('LEAD_OWNER.', '')
    .split('.');
  return {
    ownershipScope: permParts[0],
    centreScope: permParts[1],
    receiverRoleScope: permParts[2],
    receiverCentreScope: permParts[3],
  };
}

function isGM(permissions: string[]) {
  return permissions.reduce(
    (prev: boolean, perm: string) => prev || perm === 'ROLES.GENERALMANAGER',
    false,
  );
}

function isSaleHO(permissions: string[]) {
  return permissions.reduce(
    (prev: boolean, perm: string) => prev || perm === 'ROLES.SALE_HO',
    false,
  );
}

function ownershipOK(ownershipScope: string, authUserId: string, leadOwnerId?: string): boolean {
  return (ownershipScope === 'OVERRIDE')
    || ((ownershipScope === 'GIVE') && (String(authUserId) === String(leadOwnerId)))
    || ((ownershipScope === 'ASSIGN') && !leadOwnerId);
}

function centreOK(centreScope: string, authUserCentreId: string, leadCentreId?: string) {
  return !leadCentreId
    || (centreScope === 'WITHIN_ANY')
    || ((centreScope === 'WITHIN_CENTRE') && (String(authUserCentreId) === String(leadCentreId)));
}

function receiverRoleOK(receiverRoleScope: string, receiverIsGM: boolean, receiverIsSaleHO: boolean, authUserIsReceiver: boolean): boolean {
  return (receiverRoleScope === 'TO_ANY_ROLE')
    || ((receiverRoleScope === 'TO_GM_ROLE') && receiverIsGM)
    || ((receiverRoleScope === 'TO_HO_ROLE') && receiverIsSaleHO)
    || ((receiverRoleScope === 'TO_SELF') && authUserIsReceiver);
}

function receiverCentreOK(receiverCentreScope: string, receiverCentreId: string, leadCentreId?: string): boolean {
  return (receiverCentreScope === 'TO_WITHIN_ANY'
    || (receiverCentreScope === 'TO_WITHIN_CENTRE' && String(receiverCentreId) === String(leadCentreId)));
}

function onePermissionOK(perm: Permission, changer: Changer, lead: LocalLead, receiver: Receiver): boolean {
  return ownershipOK(perm.ownershipScope, changer.id, lead.ownerId)
    && centreOK(perm.centreScope, changer.centreId, lead.centreId)
    && receiverRoleOK(perm.receiverRoleScope, receiver.isGM, receiver.isSaleHO, receiver.isAuthUser)
    && receiverCentreOK(perm.receiverCentreScope, receiver.centreId, lead.centreId);
}

function byAllPermissions(changer: Changer, lead: LocalLead, receiver: Receiver): boolean {
  return isGM(changer.permissions) || changer
    .permissions
    .filter((permissionString: string) => permissionString.includes('LEAD_OWNER.'))
    .reduce((prev: boolean, permissionString: string) => {
      const permission = decode(permissionString);
      return prev || onePermissionOK(permission, changer, lead, receiver);
    }, false);
}

interface ChangeOwnerPayload {
  ids: [string];
  newOwnerId: string;
}

interface ChangeOwnerParams {
  authUser: {
    _id: string;
    permissions: [string];
    centreId: {
      _id: string,
    };
    contact: any,
  };
}

async function getLead(id: string): Promise<LocalLead> {
  const leadFound = await leadRepository.findById(id);
  if (!leadFound) {
    throw new EntityNotFoundError('Lead');
  }
  return {
    _id: _.get(leadFound, '_id'),
    centreId: _.get(leadFound, 'centre._id'),
    ownerId: _.get(leadFound, 'owner.id'),
  };
}

async function getReceiver(id: string, authUser: any): Promise<Receiver> {
  const userFound = await userRepository.getUserWithPermissions(id);
  return {
    isSaleHO: isSaleHO(userFound.permissions),
    isGM: isGM(userFound.permissions),
    fullName: userFound.fullName,
    avatarUrl: userFound.avatarUrl,
    centreId: userFound.centreId,
    isAuthUser: id === String(authUser._id),
  };
}

const updateOwner =  async (_id: string, data: ChangeOwnerPayload, params: ChangeOwnerParams): Promise<object> =>  {
  const { ids, newOwnerId } = data;

  const execUpdateOwner = async (leadId: string) => {
    try {
      const lead = await getLead(leadId);
      const receiver = await getReceiver(newOwnerId, params.authUser);
      const changer: Changer = {
        centreId: _.get(params.authUser, 'centreId._id'),
        id: params.authUser._id,
        permissions: params.authUser.permissions,
      };
      const permissionPass = byAllPermissions(changer, lead, receiver);
      if (permissionPass) {
        lead.owner = {
          id: newOwnerId,
          fullName: receiver.fullName,
          avatar: receiver.avatarUrl,
        };
        const foundCentre = await centreRepository.findById(receiver.centreId);
        await leadRepository.update({
          ...lead,
          id: leadId,
          centre: foundCentre,
        });
        return {
          id: leadId,
          status: 'Succeeded',
        };
      } else {
        return {
          id: leadId,
          status: 'Failed',
          message: 'No permission',
        };
      }
    } catch (err) {
      return {
        id: leadId,
        status: 'Failed',
        message: err.message,
      };
    }
  };

  const updateLeadPromises = ids.map((leadId) => execUpdateOwner(leadId));
  const results = await Promise.all(updateLeadPromises);
  return {
    data: results,
  };
};

export {
  decode,
  onePermissionOK,
  updateOwner,
};
