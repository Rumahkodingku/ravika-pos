export function ResponsiveList({
  cards,
  table,
  tableBreakpoint = "lg",
}: {
  cards: React.ReactNode;
  table: React.ReactNode;
  tableBreakpoint?: "lg" | "xl";
}) {
  const isXl = tableBreakpoint === "xl";
  const tableClass = isXl ? "hidden xl:block" : "hidden lg:block";
  const cardsClass = isXl
    ? "flex flex-col gap-2 p-3 xl:hidden"
    : "flex flex-col gap-2 p-3 lg:hidden";

  return (
    <>
      <div className={tableClass}>{table}</div>
      <div className={cardsClass}>{cards}</div>
    </>
  );
}
