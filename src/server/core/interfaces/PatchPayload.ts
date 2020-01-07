type ObjectOrArray = object | [any];

export interface PatchPayload {
  operation: string;
  payload: ObjectOrArray;
}
