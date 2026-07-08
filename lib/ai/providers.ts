import { customProvider } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

let hermes: ReturnType<typeof createOpenAICompatible> | null = null;

function toOpenAICompatibleEmptyChunk(model = "hermes") {
  return JSON.stringify({
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        delta: { content: "" },
        finish_reason: null,
      },
    ],
  });
}

function normalizeHermesSseData(data: string) {
  const trimmed = data.trim();
  if (!trimmed || trimmed === "[DONE]") {
    return data;
  }

  try {
    const value = JSON.parse(trimmed) as {
      choices?: unknown;
      error?: unknown;
      tool?: unknown;
      model?: string;
    };

    if (
      value.choices === undefined &&
      value.error === undefined &&
      typeof value.tool === "string"
    ) {
      return toOpenAICompatibleEmptyChunk(value.model);
    }
  } catch (_) {
    return data;
  }

  return data;
}

function createHermesCompatibleStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              controller.enqueue(
                encoder.encode(`data: ${normalizeHermesSseData(line.slice(6))}\n`)
              );
            } else {
              controller.enqueue(encoder.encode(`${line}\n`));
            }
          }
        }

        const tail = buffer + decoder.decode();
        if (tail) {
          if (tail.startsWith("data: ")) {
            controller.enqueue(
              encoder.encode(`data: ${normalizeHermesSseData(tail.slice(6))}`)
            );
          } else {
            controller.enqueue(encoder.encode(tail));
          }
        }
      } catch (error) {
        controller.error(error);
        return;
      } finally {
        reader.releaseLock();
      }

      controller.close();
    },
  });
}

async function hermesCompatibleFetch(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1]
) {
  const response = await fetch(input, init);
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.body || !contentType.includes("text/event-stream")) {
    return response;
  }

  return new Response(createHermesCompatibleStream(response.body), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

function getHermesProvider() {
  if (hermes) {
    return hermes;
  }

  const baseURL = process.env.HERMES_BASE_URL;
  if (!baseURL) {
    throw new Error("HERMES_BASE_URL is required to use the Hermes provider");
  }

  hermes = createOpenAICompatible({
    name: "hermes",
    apiKey: process.env.HERMES_API_KEY,
    baseURL,
    fetch: hermesCompatibleFetch,
  });

  return hermes;
}

function resolveHermesModelId(modelId: string) {
  return modelId === "hermes" ? (process.env.HERMES_MODEL ?? modelId) : modelId;
}

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return getHermesProvider().languageModel(resolveHermesModelId(modelId));
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return getHermesProvider().languageModel(resolveHermesModelId(titleModel.id));
}
