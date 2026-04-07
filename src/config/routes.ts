export type NavigationItem = {
  description: string;
  href: string;
  label: string;
};

export const routes = {
  authCallback: "/auth/callback",
  forgotPassword: "/forgot-password",
  home: "/",
  login: "/login",
  playgroundFoundation: "/playground/foundation",
  playgroundEditor: (projectId: string) => `/playground/editor/${encodeURIComponent(projectId)}`,
  playgroundPrototype: "/playground/prototype",
  projects: "/projects",
  register: "/register",
  resetPassword: "/reset-password",
  settings: "/settings",
  projectEditor: (projectId: string) => `/projects/${encodeURIComponent(projectId)}`,
} as const;

export const publicNavigation: NavigationItem[] = [
  {
    description: "Marketing landing and product entry.",
    href: routes.home,
    label: "Home",
  },
  {
    description: "Public authentication entry point.",
    href: routes.login,
    label: "Login",
  },
  {
    description: "Public onboarding and account creation.",
    href: routes.register,
    label: "Register",
  },
];

export const dashboardNavigation: NavigationItem[] = [
  {
    description: "Project list, empty states, and create flow.",
    href: routes.projects,
    label: "Projects",
  },
  {
    description: "Account, plan, and editor preferences.",
    href: routes.settings,
    label: "Settings",
  },
];
