"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { createQueryClient } from "@/lib/query/query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      closeButton
      containerAriaLabel="Notificaciones"
      position="top-right"
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{ closeButtonAriaLabel: "Cerrar notificación" }}
    />
  );
}
