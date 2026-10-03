import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NatureConversationResult {
  message: string;
  responseId: string;
}

/**
 * Vérifie simplement que la connexion avec OpenAI fonctionne.
 */
export async function testOpenAI(): Promise<string> {
  const response = await openai.responses.create({
    model: "gpt-5",
    input: "Réponds uniquement : Bonjour Time For Mushrooms",
  });

  return response.output_text;
}

/**
 * Première analyse sans image.
 */
export async function analyzeNature(
  category: string,
  description: string,
): Promise<NatureConversationResult> {
  const prompt = `
Tu es un naturaliste professionnel spécialisé dans l'identification prudente
des champignons, plantes, arbres et autres observations de la nature.

Catégorie :
${category}

Observation de l'utilisateur :
${description}

Effectue une première analyse en français.

Structure ta réponse comme ceci :

Identification probable :
...

Niveau de confiance :
...

Critères observés :
...

Possibilités alternatives :
...

Questions complémentaires :
Pose entre 2 et 5 questions courtes et précises à l'utilisateur afin d'améliorer
l'identification. Demande uniquement des informations réellement utiles.

Règles importantes :
- Ne jamais inventer une certitude.
- Indiquer clairement les limites de l'identification.
- Ne jamais prétendre qu'une identification à distance est certaine.
- Si des informations manquent, poser des questions précises.
- Pour un champignon, rappeler qu'une identification à distance ne permet jamais
  de décider si sa consommation est sûre.
`;

  const response = await openai.responses.create({
    model: "gpt-5",
    input: prompt,
  });

  return {
    message: response.output_text,
    responseId: response.id,
  };
}

/**
 * Première analyse avec image.
 */
export async function analyzeNatureImage(
  category: string,
  description: string,
  imageBase64: string,
): Promise<NatureConversationResult> {
  const response = await openai.responses.create({
    model: "gpt-5",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Tu es un naturaliste professionnel spécialisé dans l'identification prudente
des champignons, plantes, arbres et autres observations de la nature.

Catégorie :
${category}

Observation de l'utilisateur :
${description.trim().isNotEmpty
  ? description
  : "Aucune description fournie."}

Analyse attentivement l'image fournie.

Réponds toujours en français.

Structure ta réponse exactement ainsi :

Identification probable :
...

Niveau de confiance :
...

Critères visibles :
...

Possibilités alternatives :
...

Questions complémentaires :
Pose entre 2 et 5 questions courtes et précises à l'utilisateur afin d'améliorer
l'identification.

Si une autre photo est nécessaire, indique clairement quelle partie photographier,
par exemple :
- le dessous du chapeau ;
- le pied ;
- la base du pied ;
- une coupe longitudinale ;
- le milieu environnant.

Règles importantes :
- Ne jamais inventer une certitude.
- Signaler clairement les limites de l'identification.
- Si l'image est insuffisante, expliquer précisément pourquoi.
- Ne pas affirmer qu'un détail est visible s'il ne l'est pas réellement.
- Pour les champignons, rappeler qu'une identification par photo seule ne permet
  jamais de décider si leur consommation est sûre.
`,
          },
          {
            type: "input_image",
            image_url: `data:image/jpeg;base64,${imageBase64}`,
          },
        ],
      },
    ],
  });

  return {
    message: response.output_text,
    responseId: response.id,
  };
}

/**
 * Continue une conversation existante.
 *
 * previousResponseId correspond à l'identifiant de la dernière réponse OpenAI.
 * La fonction renvoie un nouveau responseId, qui doit remplacer l'ancien
 * dans l'application Flutter.
 */
export async function continueNatureConversation(
  previousResponseId: string,
  userMessage: string,
  imageBase64?: string,
): Promise<NatureConversationResult> {
  const content: Array<
    | {
        type: "input_text";
        text: string;
      }
    | {
        type: "input_image";
        image_url: string;
      }
  > = [
    {
      type: "input_text",
      text: `
Tu poursuis une conversation d'identification naturaliste.

Nouvelle réponse de l'utilisateur :
${userMessage.trim().isNotEmpty
  ? userMessage
  : "L'utilisateur fournit uniquement une nouvelle photo."}

Réponds toujours en français.

Règles importantes :
- Tiens compte de l'analyse et de la conversation précédentes.
- Examine la nouvelle photo si l'utilisateur en fournit une.
- Explique ce que la nouvelle information permet de confirmer ou d'écarter.
- Ne présente jamais une identification incertaine comme une certitude.
- Pose d'autres questions uniquement si elles sont réellement nécessaires.
- Si une nouvelle photo est nécessaire, indique précisément la partie à photographier.
- Pour un champignon, demande si nécessaire une photo des lamelles ou des pores,
  du pied, de la base du pied, du chapeau, d'une coupe et du milieu environnant.
- Pour un champignon, rappelle qu'une identification à distance ne permet jamais
  de décider si sa consommation est sûre.
- Reste précis, prudent et compréhensible.
`,
    },
  ];

  if (
    imageBase64 != null &&
    imageBase64.trim().isNotEmpty
  ) {
    content.add({
      type: "input_image",
      image_url: `data:image/jpeg;base64,${imageBase64}`,
    });
  }

  const response = await openai.responses.create({
    model: "gpt-5",
    previous_response_id: previousResponseId,
    input: [
      {
        role: "user",
        content,
      },
    ],
  });

  return {
    message: response.output_text,
    responseId: response.id,
  };
}