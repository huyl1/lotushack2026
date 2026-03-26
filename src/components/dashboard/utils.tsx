// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderPieLabel(props: any) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const value = Number(props.value ?? 0);

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 16;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#6b6560"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontFamily="var(--font-mono)"
      fontWeight={500}
    >
      {value}
    </text>
  );
}
