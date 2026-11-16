export function ResponsiveList({
  cards,
  table,
}: {
  cards: React.ReactNode;
  table: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden lg:block">{table}</div>
      <div className="flex flex-col gap-2 p-3 lg:hidden">{cards}</div>
    </>
  );
}
