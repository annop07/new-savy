import { AppShell } from "./app-shell/AppShell";

function Template({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export default Template;
