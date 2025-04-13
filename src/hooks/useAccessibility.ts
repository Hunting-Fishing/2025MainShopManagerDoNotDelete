
import { useEffect } from "react";

interface AccessibilityOptions {
  trapFocus?: boolean;
  ariaLive?: boolean;
  escapeToClose?: boolean;
  onEscape?: () => void;
}

export function useAccessibility(
  ref: React.RefObject<HTMLElement>,
  options: AccessibilityOptions = {}
) {
  const { trapFocus = false, ariaLive = false, escapeToClose = false, onEscape } = options;

  // Handle keyboard navigation and accessibility
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set appropriate ARIA attributes
    if (ariaLive) {
      element.setAttribute("aria-live", "polite");
    }

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (escapeToClose || onEscape)) {
        if (onEscape) onEscape();
        e.preventDefault();
      }
    };

    // Focus trap implementation
    if (trapFocus) {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const trapFocusHandler = (e: KeyboardEvent) => {
          if (e.key === "Tab") {
            if (e.shiftKey && document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        };

        element.addEventListener("keydown", trapFocusHandler);
        
        return () => {
          element.removeEventListener("keydown", trapFocusHandler);
        };
      }
    }

    if (escapeToClose || onEscape) {
      window.addEventListener("keydown", handleKeyDown);
      
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [ref, trapFocus, ariaLive, escapeToClose, onEscape]);
}
