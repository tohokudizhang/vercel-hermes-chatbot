const HERMES_MODEL_ID = "hermes";

export const DEFAULT_CHAT_MODEL = HERMES_MODEL_ID;

export const titleModel = {
  id: HERMES_MODEL_ID,
  name: "Hermes",
  provider: "hermes",
  description: "Hermes deployed model for title generation",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    id: HERMES_MODEL_ID,
    name: "Hermes",
    provider: "hermes",
    description: "Hermes deployed model",
  },
];

function envFlag(name: string, defaultValue: boolean) {
  const value = process.env[name];
  if (value == null) {
    return defaultValue;
  }
  return value !== "0" && value.toLowerCase() !== "false";
}

const hermesCapabilities: ModelCapabilities = {
  tools: envFlag("HERMES_SUPPORTS_TOOLS", false),
  vision: envFlag("HERMES_SUPPORTS_VISION", false),
  reasoning: envFlag("HERMES_SUPPORTS_REASONING", false),
};

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return Object.fromEntries(
    chatModels.map((model) => [model.id, hermesCapabilities])
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  return chatModels.map((model) => ({
    ...model,
    capabilities: hermesCapabilities,
  }));
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
