"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMounted } from "@/hooks/use-mounted";

const THEME_CYCLE = ["light", "dark", "system"] as const;
type ThemeValue = (typeof THEME_CYCLE)[number];

const THEME_ICONS: Record<ThemeValue, React.ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
};

const THEME_LABELS: Record<ThemeValue, string> = {
  light: "라이트 모드",
  dark: "다크 모드",
  system: "시스템 모드",
};

/** 라이트/다크/시스템 테마를 순환하는 토글 버튼 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = (theme as ThemeValue) ?? "system";
  const currentIndex = THEME_CYCLE.indexOf(currentTheme);
  const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(nextTheme)}
          aria-label="테마 변경"
        >
          {THEME_ICONS[currentTheme]}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{THEME_LABELS[currentTheme]}</p>
      </TooltipContent>
    </Tooltip>
  );
}
