export enum MessageMetadataTypes {
  EVENT = 'EVENT',
  COMMAND = 'COMMAND',
}

export interface MessageMetadata {
  type: string;
  timestamp: string;
}
