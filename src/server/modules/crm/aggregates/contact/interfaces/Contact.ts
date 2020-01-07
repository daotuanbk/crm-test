import { Aggregate, IsAuditable, Gender } from '@app/core';

export type Relations = 'SON'|'DAUGHTER'|'GRAND_SON'|'GRAND_DAUGHTER'|'NEPHEW'|'OTHER';

export interface FamilyMember {
  _id: string; // Reference other 'Contact'
  fullName: string; // De-normalize for search
  phoneNumber: string;
  email: string;
  relation: Relations;
}

export interface Contact extends Aggregate, IsAuditable {
  _id: string;
  fullName: string;
  phoneNumber: string;
  gender: Gender;
  email: string;
  address: string;
  dob: Date;
  facebook: string;
  zalo: string;
  school: string;
  family: FamilyMember[];
}
