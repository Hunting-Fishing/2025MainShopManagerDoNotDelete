import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function KeyboardShortcuts() {
  const navigate = useNavigate();

  // Global nav shortcuts
  useHotkeys('g d', () => navigate('/dashboard'));
  useHotkeys('g w', () => navigate('/work-orders'));
  useHotkeys('g c', () => navigate('/customers'));

  // Start dashboard tour
  useHotkeys('shift+/', () => {
    window.dispatchEvent(new CustomEvent('start-dashboard-tour'));
    toast({ title: 'Help', description: 'Starting dashboard tour…' });
  });

  useEffect(() => {
    // Hint once per session
    if (!sessionStorage.getItem('ux_hint_shown')) {
      sessionStorage.setItem('ux_hint_shown', '1');
      toast({ title: 'Pro tip', description: "Press Shift+/ to start a quick tour. Use 'g d', 'g w', 'g c' to jump around." });
    }
  }, []);

  return null;
}
