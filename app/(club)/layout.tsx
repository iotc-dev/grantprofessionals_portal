export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* TODO: Club header/nav will go here */}
      <main>{children}</main>
    </div>
  );
}