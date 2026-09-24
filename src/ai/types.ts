// Provider-agnostic mentor interface. The UI and domain talk to this, never to a
// vendor SDK, so another provider (or a Founder OS proxy) can be swapped in.

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface MentorRequest {
  /** Stable instructions first (cacheable), then today's volatile context. */
  system: { persona: string; context: string };
  messages: ChatTurn[];
  model: string;
  signal?: AbortSignal;
}

export interface MentorReply {
  text: string;
  /** Set when the provider declined or stopped early, e.g. "refusal", "max_tokens". */
  stopReason?: string;
}

export interface MentorProvider {
  id: string;
  label: string;
  /** Streams text through onText as it arrives and resolves with the full reply. */
  send(req: MentorRequest, onText: (delta: string) => void): Promise<MentorReply>;
}

/** Errors a provider throws should be one of these, so the UI can explain them. */
export class MentorError extends Error {
  constructor(
    message: string,
    readonly kind: "auth" | "rate_limit" | "network" | "bad_request" | "server" | "unknown",
  ) {
    super(message);
  }
}
