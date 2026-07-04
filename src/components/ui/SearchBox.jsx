/**
 * SearchBox — Premium unified search component for EBOOKVALA.
 *
 * Props:
 *   placeholder      — Placeholder text shown in the input
 *   value            — Controlled input value
 *   onChange         — Change handler (receives event)
 *   onSubmit         — Form submit handler (receives event); also called on Enter
 *   onClear          — Called when the ✕ clear button is clicked
 *   onFocus          — Called when input gains focus
 *   onBlur           — Called when input loses focus
 *   showButton       — Show an inline gradient "Search" button (hero / large mode)
 *   buttonLabel      — Label for the inline button (default "Search")
 *   size             — "sm" | "md" | "lg"  (default "md")
 *   suggestions      — React node rendered as the dropdown panel content
 *   showSuggestions  — Whether the dropdown is visible
 *   inputRef         — Forwarded ref for the <input> element
 *   id               — id attr on the input (for label association)
 *   autoFocus        — focus on mount
 *   className        — Extra classes on the outer wrapper
 *   inputClassName   — Extra classes on the <input> element
 *   isLoading        — Show loading spinner in the button
 *   disabled         — Disable the whole component
 *   shortcutHint     — Show keyboard shortcut badge (e.g. "/" or "⌘K")
 *                      Pass false to suppress (default shows "/" hint)
 */

import React, { useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cx = (...args) => twMerge(clsx(...args));

// Height, icon size, font size per size variant
const sizeMap = {
  sm: {
    wrapper: "h-10",
    input: "pl-9 pr-8 py-2 text-xs",
    icon: "h-3.5 w-3.5 left-3 top-[11px]",
    clearBtn: "right-2.5 top-[9px]",
    clearIcon: "h-3.5 w-3.5",
    shortcut: "right-2.5 top-[9px]",
    btnClass: "h-8 px-4 text-[11px] rounded-xl",
  },
  md: {
    wrapper: "h-[52px]",
    input: "pl-11 pr-10 py-3 text-sm",
    icon: "h-4.5 w-4.5 left-3.5 top-[14px]",
    clearBtn: "right-3 top-[14px]",
    clearIcon: "h-4 w-4",
    shortcut: "right-3 top-[13px]",
    btnClass: "h-10 px-5 text-xs rounded-[14px]",
  },
  lg: {
    wrapper: "h-14",
    input: "pl-12 pr-36 py-3.5 text-sm sm:text-base",
    icon: "h-5 w-5 left-4 top-[17px]",
    clearBtn: "right-4 top-[17px]",
    clearIcon: "h-4.5 w-4.5",
    shortcut: "right-4 top-[16px]",
    btnClass: "h-10 px-5 text-sm font-bold rounded-[14px]",
  },
};

export const SearchBox = React.forwardRef(
  (
    {
      placeholder = "Search books, authors, categories...",
      value = "",
      onChange,
      onSubmit,
      onClear,
      onFocus,
      onBlur,
      showButton = false,
      buttonLabel = "Search",
      size = "md",
      suggestions,
      showSuggestions = false,
      inputRef: externalRef,
      id,
      autoFocus = false,
      className,
      inputClassName,
      isLoading = false,
      disabled = false,
      shortcutHint = "/",
    },
    ref
  ) => {
    const internalRef = useRef(null);
    const inputEl = externalRef || internalRef;
    const generatedId = useId();
    const inputId = id || generatedId;

    const s = sizeMap[size] || sizeMap.md;
    const hasValue = value && value.length > 0;

    const handleClear = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClear?.();
      inputEl.current?.focus();
    };

    return (
      <div
        ref={ref}
        className={cx("relative w-full", className)}
        role="search"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.(e);
          }}
          autoComplete="off"
          className="w-full"
        >
          {/* Main search shell */}
          <motion.div
            whileFocus={{ scale: 1.002 }}
            className={cx(
              // Base layout
              "relative flex items-center w-full rounded-2xl",
              // Glass / background
              "bg-brand-bg-secondary",
              // Border
              "border border-brand-border",
              // Subtle shadow
              "shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
              // Hover effect
              "hover:border-brand-border/80 hover:shadow-[0_2px_16px_rgba(0,0,0,0.07)]",
              // Focus ring (applies when child input is focused)
              "focus-within:border-brand-accent focus-within:ring-4 focus-within:ring-brand-accent/10",
              // Transition
              "transition-all duration-200",
              // Height variant
              s.wrapper,
              disabled && "opacity-50 pointer-events-none"
            )}
          >
            {/* Search icon — always on the left */}
            <Search
              className={cx(
                "absolute pointer-events-none text-brand-text-secondary/50 transition-colors duration-200 group-focus-within:text-brand-accent",
                // When focused, tint the icon
                "peer-focus:text-brand-accent",
                s.icon
              )}
              aria-hidden="true"
            />

            {/* The input itself */}
            <input
              ref={inputEl}
              id={inputId}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              autoFocus={autoFocus}
              disabled={disabled}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              className={cx(
                // Full width, transparent bg (shell handles the look)
                "w-full bg-transparent border-none outline-none",
                // Typography
                "font-medium text-brand-text placeholder:text-brand-text-secondary/50",
                // No ring on the input itself (handled by parent)
                "focus:outline-none focus:ring-0",
                // Spacing from size map
                s.input,
                // If button is shown, add extra right padding so text doesn't overlap it
                showButton && "pr-[140px] sm:pr-[148px]",
                inputClassName
              )}
            />

            {/* Clear button — shown when there's text (no button mode) */}
            {!showButton && hasValue && (
              <AnimatePresence>
                <motion.button
                  type="button"
                  key="clear"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.12 }}
                  onClick={handleClear}
                  aria-label="Clear search"
                  className={cx(
                    "absolute flex items-center justify-center rounded-full",
                    "text-brand-text-secondary/60 hover:text-brand-text hover:bg-brand-border/30",
                    "transition-all duration-150 p-0.5 cursor-pointer",
                    s.clearBtn
                  )}
                >
                  <X className={s.clearIcon} />
                </motion.button>
              </AnimatePresence>
            )}

            {/* Keyboard shortcut badge (shown when input is empty, no button mode) */}
            {!showButton && !hasValue && shortcutHint && (
              <span
                className={cx(
                  "absolute pointer-events-none select-none",
                  "flex items-center justify-center",
                  "rounded-md border border-brand-border/70 bg-brand-bg",
                  "text-[9px] font-bold text-brand-text-secondary/60",
                  "py-0.5 px-1.5 shadow-sm",
                  "opacity-0 focus-within:opacity-0",
                  // We use CSS peer trick via Tailwind group instead
                  "group-focus-within:opacity-0 transition-opacity duration-200",
                  s.shortcut
                )}
                aria-hidden="true"
              >
                {shortcutHint}
              </span>
            )}

            {/* Inline search button (showButton mode — hero / large) */}
            {showButton && (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading}
                className={cx(
                  "absolute right-2 flex items-center justify-center gap-1.5 shrink-0",
                  "bg-brand-accent hover:bg-brand-accent/90 text-white",
                  "font-bold tracking-tight cursor-pointer",
                  "shadow-[0_2px_8px_rgba(0,122,255,0.35)] hover:shadow-[0_4px_12px_rgba(0,122,255,0.45)]",
                  "transition-all duration-200",
                  "disabled:opacity-70 disabled:cursor-not-allowed",
                  s.btnClass
                )}
                aria-label={buttonLabel}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{buttonLabel}</span>
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        </form>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions && (
            <motion.div
              key="suggestions-panel"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              role="listbox"
              aria-label="Search suggestions"
              className={cx(
                "absolute left-0 right-0 z-50 mt-2",
                "bg-brand-card border border-brand-border rounded-2xl",
                "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
                "p-2 overflow-hidden"
              )}
            >
              {suggestions}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";
export default SearchBox;
