/**
 * @typedef {{ optionId: number, optionName: str }} Option
 * @typedef {{ optionId: number, keypadIds: number[], votes: number, percentage: float }} Result
 * @typedef {{ isVisible: bool, backgroundColor: "black" | "white", options: Option[] }} AudienceState
 */

/**
 * A wrapper function to aid with intellisense.
 * @public
 * @param { str } raw String data.
 * @return { AudienceState } The state of the audience UI.
 */
export const deserialize = (raw) =>
  raw
    ? JSON.parse(raw)
    : { isVisible: false, backgroundColor: "white", options: [] };
