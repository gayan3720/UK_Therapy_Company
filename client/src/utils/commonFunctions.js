import moment from "moment";

export const disabledDateFromToday = (current) => {
  // Can not select days before today
  return current && current < moment().startOf("day");
};
