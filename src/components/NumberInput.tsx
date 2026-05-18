import React, { FC, useEffect, useRef, useState } from "react";

export interface NumberInputProps {
  initialValue?: number | undefined;
  externalValue?: number | undefined;
  validate?: ((v: number) => boolean) | undefined;
  onSubmit: (value: number) => void;
  onCancel: () => void;
  onChange?: ((value: number) => void) | undefined;
  showConfirmButton?: boolean | undefined;
  confirmLabel?: string | undefined;
  confirmButtonClassName?: string | undefined;
  tabCancels?: boolean | undefined;
  enableArrowNudge?: boolean | undefined;
  arrowMinimum?: number | undefined;
  inputClassName?: string | undefined;
  className?: string | undefined;
  autoFocus?: boolean | undefined;
}

const DEFAULT_INPUT_CLASS =
  "w-20 px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 " +
  "focus:border-blue-500 focus:outline-none";

const DEFAULT_CONFIRM_CLASS =
  "px-2 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded";

export const NumberInput: FC<NumberInputProps> = ({
  initialValue,
  externalValue,
  validate = (v) => v > 0,
  onSubmit,
  onCancel,
  onChange,
  showConfirmButton,
  confirmLabel = "OK",
  confirmButtonClassName = DEFAULT_CONFIRM_CLASS,
  tabCancels = false,
  enableArrowNudge = true,
  arrowMinimum = 0.01,
  inputClassName = DEFAULT_INPUT_CLASS,
  className = "flex items-center gap-2",
  autoFocus = true,
}) => {
  const [text, setText] = useState<string>(initialValue?.toFixed(2) ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [autoFocus]);

  useEffect(() => {
    setText(initialValue?.toFixed(2) ?? "");
  }, [initialValue]);

  useEffect(() => {
    if (externalValue !== undefined) setText(externalValue.toFixed(2));
  }, [externalValue]);

  const trySubmit = () => {
    const v = parseFloat(text);
    if (!isNaN(v) && validate(v)) onSubmit(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      trySubmit();
    } else if (e.key === "Escape" || (tabCancels && e.key === "Tab")) {
      e.preventDefault();
      onCancel();
    } else if (
      enableArrowNudge &&
      (e.key === "ArrowUp" || e.key === "ArrowDown")
    ) {
      e.preventDefault();
      const current = parseFloat(text) || 0;
      const step = e.shiftKey ? 0.1 : 1;
      const next =
        e.key === "ArrowUp"
          ? current + step
          : Math.max(arrowMinimum, current - step);
      const rounded = parseFloat(next.toFixed(2));
      setText(String(rounded));
      if (onChange && validate(rounded)) onChange(rounded);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setText(v);
    if (onChange) {
      const num = parseFloat(v);
      if (!isNaN(num) && validate(num)) onChange(num);
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={inputClassName}
        placeholder="Value"
      />
      {showConfirmButton && (
        <button onClick={trySubmit} className={confirmButtonClassName}>
          {confirmLabel}
        </button>
      )}
    </div>
  );
};
