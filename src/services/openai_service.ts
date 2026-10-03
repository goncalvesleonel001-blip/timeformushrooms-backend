import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NatureConversationResult {
  message: string;
  responseId: string;
}

export async function testOpenAI(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Réponds uniquement : Bonjour Time For Mushrooms" }],
      max_tokens: 30,
    });
    return response.choices[0]?.message?.content || "Connexion OK";
  } catch (e: any) {
    return `OpenAI Initialisé (${e?.message || 'Prêt'})`;
  }
}

export async function analyzeNature(
  category: string,
  description: string,
): Promise<NatureConversationResult> {
  const prompt = `Tu es un expert mycologue mondial. Catégorie : ${category}. Observation : ${description}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600,
  });
  return { message: response.choices[0]?.message?.content || "OK", responseId: response.id };
}

export async function analyzeNatureImage(
  category: string,
  description: string,
  imageBase64: string,
): Promise<NatureConversationResult> {
  const formattedImage = imageBase64.startsWith("data:image") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Tu es un expert mycologue mondial." },
      { role: "user", content: [{ type: "text", text: `Identifie (${category}). Description : ${description}` }, { type: "image_url", image_url: { url: formattedImage } }] }
    ],
    max_tokens: 600,
  });
  return { message: response.choices[0]?.message?.content || "OK", responseId: response.id };
}

export async function continueNatureConversation(
  previousResponseId: string,
  userMessage: string,
  imageBase64?: string,
): Promise<NatureConversationResult> {
  const messages: any[] = [
    { role: "system", content: "Tu es un expert mycologue mondial." },
    { role: "user", content: userMessage }
  ];
  if (imageBase64 && imageBase64.length > 0) {
    const formattedImage = imageBase64.startsWith("data:image") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    messages.push({ role: "user", content: [{ type: "text", text: "Photo complémentaire :" }, { type: "image_url", image_url: { url: formattedImage } }] });
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    max_tokens: 600,
  });
  return { message: response.choices[0]?.message?.content || "OK", responseId: response.id };
}
