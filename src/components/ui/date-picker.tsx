import { forwardRef } from "react";
import { Input, type InputProps } from "@/components/ui/input";

export type DatePickerProps = Omit<InputProps, "type">;

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => <Input ref={ref} type="date" {...props} />,
);

DatePicker.displayName = "DatePicker";
