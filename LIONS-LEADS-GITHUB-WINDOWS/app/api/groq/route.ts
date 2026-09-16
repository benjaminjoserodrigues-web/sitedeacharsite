import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "A integração com a Groq não está configurada." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { messages?: ChatMessage[] };
    const messages = body.messages?.filter(
      (message) =>
        ["system", "user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    );

    if (!messages?.length || messages.length > 20) {
      return NextResponse.json(
        { error: "Envie entre 1 e 20 mensagens válidas." },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages,
        temperature: 0.4,
        max_completion_tokens: 600,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return NextResponse.json(
        { error: "A Groq não conseguiu processar a solicitação." },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return NextResponse.json({ content: data.choices?.[0]?.message?.content ?? "" });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? "A Groq demorou mais que o esperado." : "Não foi possível processar a solicitação." },
      { status: timedOut ? 504 : 500 },
    );
  }
}
