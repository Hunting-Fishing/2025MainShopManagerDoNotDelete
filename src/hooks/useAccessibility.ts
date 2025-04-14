
import { useEffect, useCallback, RefObject } from "react";

interface AccessibilityOptions {
  trapFocus?: boolean;
  ariaLive?: boolean;
  escapeToClose?: boolean;
  onEscape?: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  autoFocus?: boolean;
  role?: string;
}

export function useAccessibility(
  ref: RefObject<HTMLElement>,
  options: AccessibilityOptions = {}
) {
  const { 
    trapFocus = false, 
    ariaLive = false, 
    escapeToClose = false, 
    onEscape, 
    ariaLabel,
    ariaDescribedBy,
    autoFocus = false,
    role
  } = options;

  // Handle escape key
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && (escapeToClose || onEscape)) {
      if (onEscape) onEscape();
      e.preventDefault();
    }
  }, [escapeToClose, onEscape]);

  // Apply ARIA attributes and role
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Apply ARIA attributes
    if (ariaLive) {
      element.setAttribute("aria-live", "polite");
    }
    
    if (ariaLabel) {
      element.setAttribute("aria-label", ariaLabel);
    }
    
    if (ariaDescribedBy) {
      element.setAttribute("aria-describedby", ariaDescribedBy);
    }
    
    if (role) {
      element.setAttribute("role", role);
    }

    // Auto-focus the first focusable element if requested
    if (autoFocus) {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    return () => {
      // Clean up attributes when component unmounts
      if (ariaLive) element.removeAttribute("aria-live");
      if (ariaLabel) element.removeAttribute("aria-label");
      if (ariaDescribedBy) element.removeAttribute("aria-describedby");
      if (role) element.removeAttribute("role");
    };
  }, [ref, ariaLive, ariaLabel, ariaDescribedBy, autoFocus, role]);

  // Handle keyboard navigation and trap focus
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Handle escape key
    if (escapeToClose || onEscape) {
      window.addEventListener("keydown", handleEscapeKey);
    }

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
          if (escapeToClose || onEscape) {
            window.removeEventListener("keydown", handleEscapeKey);
          }
        };
      }
    }

    if (escapeToClose || onEscape) {
      return () => {
        window.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [ref, trapFocus, escapeToClose, onEscape, handleEscapeKey]);
}
