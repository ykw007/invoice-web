import { SectionHeading } from "@/components/common/section-heading";

const COLOR_GROUPS = [
  {
    label: "Primary",
    swatches: [
      { name: "Primary", bg: "bg-primary", text: "text-primary-foreground" },
      { name: "Primary Foreground", bg: "bg-primary-foreground", text: "text-primary", border: true },
    ],
  },
  {
    label: "Secondary",
    swatches: [
      { name: "Secondary", bg: "bg-secondary", text: "text-secondary-foreground" },
      { name: "Secondary Foreground", bg: "bg-secondary-foreground", text: "text-secondary", border: true },
    ],
  },
  {
    label: "Accent",
    swatches: [
      { name: "Accent", bg: "bg-accent", text: "text-accent-foreground" },
      { name: "Accent Foreground", bg: "bg-accent-foreground", text: "text-accent", border: true },
    ],
  },
  {
    label: "Muted",
    swatches: [
      { name: "Muted", bg: "bg-muted", text: "text-muted-foreground" },
      { name: "Muted Foreground", bg: "bg-muted-foreground", text: "text-muted", border: true },
    ],
  },
  {
    label: "Destructive",
    swatches: [
      { name: "Destructive", bg: "bg-destructive", text: "text-white" },
    ],
  },
  {
    label: "Chart",
    swatches: [
      { name: "Chart 1", bg: "bg-chart-1", text: "text-white" },
      { name: "Chart 2", bg: "bg-chart-2", text: "text-white" },
      { name: "Chart 3", bg: "bg-chart-3", text: "text-white" },
      { name: "Chart 4", bg: "bg-chart-4", text: "text-white" },
      { name: "Chart 5", bg: "bg-chart-5", text: "text-white" },
    ],
  },
];

/** CSS 변수 기반 색상 팔레트 시각화 */
export function ColorPalette() {
  return (
    <section className="container mx-auto px-4 py-16 space-y-8">
      <SectionHeading
        title="색상 팔레트"
        description="globals.css에 정의된 OKLCH 색상 변수를 시각화합니다."
      />

      <div className="space-y-6">
        {COLOR_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.swatches.map((swatch) => (
                <div
                  key={swatch.name}
                  className={`${swatch.bg} ${swatch.text} ${swatch.border ? "border border-border" : ""} rounded-md px-4 py-3 text-xs font-medium min-w-[120px]`}
                >
                  {swatch.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
