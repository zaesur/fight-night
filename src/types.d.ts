type Vote = { keypadId: number; options: Array<number> };
type WithErrorJSON<T> = T | { error: string };

type GetStateJSON = WithErrorJSON<{
  result: {
    keypadIds: Array<number>;
    active_question: boolean;
    hardware_state: boolean;
  };
}>;

type StartHardwareJSON = WithErrorJSON<{ result: string }>;
type StopHardwareJSON = WithErrorJSON<{ result: string }>;
type StartQuestionJSON = WithErrorJSON<{ result: string }>;
type StopQuestionJSON = WithErrorJSON<{ result: Array<Vote> }>;
type GetQuestionJSON = WithErrorJSON<{ result: Array<Vote> }>;

type BucketRecord = Record<number, Array<number>>;
type StatisticRecord = Record<
  number,
  { keypadIds: Array<number>; count: number; percentage: number }
>;
