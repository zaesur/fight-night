type Vote = { keypadId: number; options: Array<number> };
type ErrorJSON<T> = T | { error: string };

type GetStateJSON = ErrorJSON<{
  result: {
    keypadIds: Array<number>;
    active_question: boolean;
    hardware_state: boolean;
  };
}>;

type StartHardwareJSON = ErrorJSON<{ result: string }>;
type StopHardwareJSON = ErrorJSON<{ result: string }>;
type StartQuestionJSON = ErrorJSON<{ result: string }>;
type StopQuestionJSON = ErrorJSON<{ result: Array<Vote> }>;
type GetQuestionJSON = ErrorJSON<{ result: Array<Vote> }>;
