import { api } from "./api";

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty" | "changed_to" | "changed_from";
  value: string;
}

export interface AutomationAction {
  type: "assign_to" | "set_status" | "set_priority" | "add_label" | "remove_label" | "set_due_date" | "move_to_sprint" | "notify" | "add_subtask" | "webhook";
  config: Record<string, string>;
}

export interface AutomationRule {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  projectId?: string;
  trigger: string;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  createdBy: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RuleResponse {
  status: string;
  data: { rule: AutomationRule };
}

interface RulesResponse {
  status: string;
  data: { rules: AutomationRule[] };
}

export const automationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceRules: builder.query<AutomationRule[], string>({
      query: (workspaceId) => `/automation/workspace/${workspaceId}`,
      transformResponse: (response: RulesResponse) => response.data.rules,
    }),
    getProjectRules: builder.query<AutomationRule[], string>({
      query: (projectId) => `/automation/project/${projectId}`,
      transformResponse: (response: RulesResponse) => response.data.rules,
    }),
    getAutomationRule: builder.query<AutomationRule, string>({
      query: (id) => `/automation/${id}`,
      transformResponse: (response: RuleResponse) => response.data.rule,
    }),
    createAutomationRule: builder.mutation<AutomationRule, {
      name: string; description?: string; workspaceId: string; projectId?: string;
      trigger: string; conditions: AutomationCondition[]; actions: AutomationAction[];
    }>({
      query: (body) => ({
        url: "/automation",
        method: "POST",
        body,
      }),
      transformResponse: (response: RuleResponse) => response.data.rule,
    }),
    updateAutomationRule: builder.mutation<AutomationRule, { id: string; data: Partial<AutomationRule> }>({
      query: ({ id, data }) => ({
        url: `/automation/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: RuleResponse) => response.data.rule,
    }),
    toggleAutomationRule: builder.mutation<AutomationRule, string>({
      query: (id) => ({
        url: `/automation/${id}/toggle`,
        method: "PUT",
      }),
      transformResponse: (response: RuleResponse) => response.data.rule,
    }),
    deleteAutomationRule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/automation/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetWorkspaceRulesQuery,
  useGetProjectRulesQuery,
  useGetAutomationRuleQuery,
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
  useToggleAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
} = automationApi;
