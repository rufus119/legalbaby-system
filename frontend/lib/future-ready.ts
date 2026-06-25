export type AccountPlan = "free" | "pro" | "enterprise";

export type AccountProfile = {
  id: string;
  email: string;
  displayName: string;
  plan: AccountPlan;
  createdAt: string;
};

export type TeamMemberRole = "owner" | "admin" | "member" | "viewer";

export type TeamMember = {
  id: string;
  accountId: string;
  role: TeamMemberRole;
  joinedAt: string;
};

export type WorkspaceProfile = {
  id: string;
  name: string;
  teamId: string;
  shared: boolean;
  createdAt: string;
};

export type BillingCycle = "monthly" | "yearly";

export type BillingSubscription = {
  id: string;
  accountId: string;
  plan: AccountPlan;
  cycle: BillingCycle;
  status: "active" | "trial" | "past_due" | "canceled";
  renewalDate: string;
};

export type FutureArchitectureSnapshot = {
  accountsReady: boolean;
  teamsReady: boolean;
  workspacesReady: boolean;
  billingReady: boolean;
};

export const futureArchitectureDefaults: FutureArchitectureSnapshot = {
  accountsReady: true,
  teamsReady: true,
  workspacesReady: true,
  billingReady: true,
};
