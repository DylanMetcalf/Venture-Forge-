// Claude via the official Anthropic SDK, called directly from the browser with the
// user's own API key (single-user, personal app; the key never leaves the device
// except to api.anthropic.com). The SDK is loaded lazily so it costs nothing
// until the mentor is used.
import type { MentorProvider, MentorReply, MentorRequest } from "./types";
import { MentorError } from "./types";

export function createAnthropicProvider(getKey: () => string | null): MentorProvider {
  return {
    id: "anthropic",
    label: "Claude (Anthropic)",
    async send(req: MentorRequest, onText): Promise<MentorReply> {
      const apiKey = getKey();
      if (!apiKey) throw new MentorError("Add your Anthropic API key in Settings to use the mentor.", "auth");
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
      try {
        const stream = client.beta.messages.stream(
          {
            model: req.model,
            max_tokens: 16000,
            thinking: { type: "adaptive" },
            // Server-side refusal fallback: a declined request is retried on the
            // recommended model inside the same call.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            system: [
              { type: "text", text: req.system.persona, cache_control: { type: "ephemeral" } },
              { type: "text", text: req.system.context },
            ],
            messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
          },
          { signal: req.signal },
        );
        stream.on("text", (delta) => onText(delta));
        const message = await stream.finalMessage();
        const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
        if (message.stop_reason === "refusal") {
          return { text: text || "The model declined to answer that. Try rephrasing the question.", stopReason: "refusal" };
        }
        return { text, stopReason: message.stop_reason ?? undefined };
      } catch (e) {
        if (e instanceof Anthropic.AuthenticationError) throw new MentorError("The API key was rejected. Check it in Settings.", "auth");
        if (e instanceof Anthropic.RateLimitError) throw new MentorError("Rate limited by the API. Wait a moment and try again.", "rate_limit");
        if (e instanceof Anthropic.BadRequestError) throw new MentorError(`The request was rejected: ${e.message}`, "bad_request");
        if (e instanceof Anthropic.APIConnectionError) throw new MentorError("Couldn't reach the API. Check your connection.", "network");
        if (e instanceof Anthropic.APIError) throw new MentorError(`The API returned an error (${e.status ?? "unknown"}).`, "server");
        if (e instanceof Error && e.name === "AbortError") throw e;
        throw new MentorError(e instanceof Error ? e.message : "Unknown error.", "unknown");
      }
    },
  };
}
