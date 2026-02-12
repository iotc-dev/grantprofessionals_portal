export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* TODO: Staff sidebar + header will go here */}
      <main>{children}</main>
    </div>
  );
}