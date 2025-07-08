import React from "react";
import ClientsHeader from "@/components/clients/ClientsHeader";

interface ClientsDashboardLayoutProps {
  headerProps: React.ComponentProps<typeof ClientsHeader>;
  children: React.ReactNode;
}

const ClientsDashboardLayout = ({
  headerProps,
  children,
}: ClientsDashboardLayoutProps) => {
  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <ClientsHeader {...headerProps} />
      <main className="flex-1 flex flex-col w-full px-4 py-4 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default ClientsDashboardLayout;
