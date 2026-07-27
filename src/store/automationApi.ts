import { api } from "./api";

export type AutomationTrigger =
  | "task.created"
  | "task.updated"
  | "task.status_changed"
  | "task.assigned"
  | "comment.added"
  | "scheduled"
  | "sprint.started"
  | "sprint.completed";

export type AutomationActionType =
  | "assign_to"
  | "set_status"
  | "set_priority"
  | "add_label"
  | "remove_label"
  | "set_due_date"
  | "move_to_sprint"
  | "notify"
  | "add_subtask"
  | "webhook"
  | "add_comment"
  | "create_issue"
  | "link_issues";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty"
  | "changed_to"
  | "changed_from";

export type BranchType = "subtask" | "linked_issue" | "jql";

export interface AutomationCondition {
  field: string;
  operator: ConditionOperator;
  value: string;
}

export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, string>;
}

export interface AutomationBranch {
  type: BranchType;
  config: Record<string, string>;
  actions: AutomationAction[];
}

export interface AutomationRule {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  projectId?: string;
  trigger: AutomationTrigger;
  cronExpression?: string;
  conditions: AutomationCondition[];
  branches: AutomationBranch[];
  actions: AutomationAction[];
  enabled: boolean;
  createdBy: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

export interface AutomationAuditEntry {
  _id: string;
  ruleId: string;
  ruleName: string;
  taskKey: string;
  action: string;
  status: "success" | "error";
  errorMessage?: string;
  timestamp: string;
}

interface RuleResponse {
  status: string;
  data: { rule: AutomationRule };
}

interface RulesResponse {
  status: string;
  data: { rules: AutomationRule[] };
}

interface AuditResponse {
  status: string;
  data: { entries: AutomationAuditEntry[] };
}

interface ParseResponse {
  status: string;
  data: {
    trigger: AutomationTrigger;
    conditions: AutomationCondition[];
    actions: AutomationAction[];
  };
}

export const automationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaceRules: builder.query<AutomationRule[], string>({
      query: (workspaceId) => `/automation/workspace/${workspaceId}`,
      transformResponse: (response: RulesResponse) => response.data.rules,
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: "Automation" as const, id: _id })), { type: "Automation", id: "LIST" }]
          : [{ type: "Automation", id: "LIST" }],
    }),
    getProjectRules: builder.query<AutomationRule[], string>({
      query: (projectId) => `/automation/project/${projectId}`,
      transformResponse: (response: RulesResponse) => response.data.rules,
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: "Automation" as const, id: _id })), { type: "Automation", id: "LIST" }]
          : [{ type: "Automation", id: "LIST" }],
    }),
    getAutomationRule: builder.query<AutomationRule, string>({
      query: (id) => `/automation/${id}`,
      transformResponse: (response: RuleResponse) => response.data.rule,
      providesTags: (_result, _error, id) => [{ type: "Automation", id }],
    }),
    createAutomationRule: builder.mutation<
      AutomationRule,
      {
        name: string;
        description?: string;
        workspaceId: string;
        projectId?: string;
        trigger: AutomationTrigger;
        cronExpression?: string;
        conditions: AutomationCondition[];
        branches?: AutomationBranch[];
        actions: AutomationAction[];
      }
    >({
      query: (body) => ({
        url: "/automation",
        method: "POST",
        body,
      }),
      transformResponse: (response: RuleResponse) => response.data.rule,
      invalidatesTags: [{ type: "Automation", id: "LIST" }],
    }),
    updateAutomationRule: builder.mutation<
      AutomationRule,
      { id: string; data: Partial<AutomationRule> }
    >({
      query: ({ id, data }) => ({
        url: `/automation/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: RuleResponse) => response.data.rule,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Automation", id },
        { type: "Automation", id: "LIST" },
      ],
    }),
    toggleAutomationRule: builder.mutation<AutomationRule, string>({
      query: (id) => ({
        url: `/automation/${id}/toggle`,
        method: "PUT",
      }),
      transformResponse: (response: RuleResponse) => response.data.rule,
      invalidatesTags: (_result, _error, id) => [
        { type: "Automation", id },
        { type: "Automation", id: "LIST" },
      ],
    }),
    deleteAutomationRule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/automation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Automation", id },
        { type: "Automation", id: "LIST" },
      ],
    }),
    copyAutomationRule: builder.mutation<AutomationRule, string>({
      query: (id) => ({
        url: `/automation/${id}/copy`,
        method: "POST",
      }),
      transformResponse: (response: RuleResponse) => response.data.rule,
      invalidatesTags: [{ type: "Automation", id: "LIST" }],
    }),
    getRuleAudit: builder.query<AutomationAuditEntry[], string>({
      query: (ruleId) => `/automation/${ruleId}/audit`,
      transformResponse: (response: AuditResponse) => response.data.entries,
    }),
    parseNaturalLanguage: builder.mutation<
      { trigger: AutomationTrigger; conditions: AutomationCondition[]; actions: AutomationAction[] },
      string
    >({
      query: (description) => ({
        url: "/automation/parse-natural-language",
        method: "POST",
        body: { description },
      }),
      transformResponse: (response: ParseResponse) => response.data,
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
  useCopyAutomationRuleMutation,
  useGetRuleAuditQuery,
  useParseNaturalLanguageMutation,
} = automationApi;
