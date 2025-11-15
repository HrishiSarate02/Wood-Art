import { GoogleGenAI, Modality } from "@google/genai";
import { GenerationStyle, LineThickness } from "../types";

const PROMPTS = {
  [GenerationStyle.STENCIL]: `Create a clean, high-contrast stencil vector portrait from the provided photo, specifically designed for laser cutting, CNC, or Glowforge. The final artwork must adhere to these strict requirements:
1. **Line Quality:** All lines must be smooth, clean, and flowing with a consistent thin-to-medium thickness suitable for cutting. Avoid any rough, jagged, shaky, or pixelated edges. The output should look like a professional, manually drawn vector illustration.
2. **Closed Shapes:** All shapes must be fully closed paths with no open strokes. All regions must connect properly to create a single, cohesive piece. Absolutely no floating "islands" are allowed.
3. **Minimal Fills:** Use solid black fills sparingly, only for essential areas like hair or deep shadows. The design should primarily use elegant contour lines and open shapes, not heavy black blocks.
4. **Stylized Features:** Simplify facial features while retaining likeness. Eyes should be stylized, nose and cheek lines should be minimal, and lips should be cleanly shaped. Smile lines must be smooth, curved, and simple.
5. **Overall Style:** The final result must be a simple, elegant, and clean stencil illustration, perfectly cuttable, consisting of only two tones: solid black shapes and a transparent background.`,
  [GenerationStyle.STENCIL_V2]: `Create a clean, high-contrast stencil vector portrait based on the provided photo. The goal is a CNC-ready artwork that captures likeness with elegant, flowing lines.

Key Requirements:
1.  **Line & Shape:** Use smooth, clean lines and fully closed paths. Allow for some variation in line thickness to capture finer details, like curls and folds in clothing, while ensuring all parts are substantial enough for laser cutting.
2.  **Detail Retention:** Pay close attention to the subtle details in clothing. Replicate gentle curves, folds, and collar shapes accurately. Avoid over-simplifying these areas.
3.  **Connected Geometry:** All black shapes must be connected into a single, cohesive piece. There should be absolutely no floating "islands" or disconnected parts.
4.  **Stylization:** Simplify facial features into stylized but recognizable forms. The final piece should feel like a handcrafted illustration, not a direct trace. Use only solid black shapes on a clear background, with no gradients or shading.
5.  **Lip and Mouth Design:** Pay special attention to the mouth area. Stylize the lips with a clean, continuous outline. If the mouth is open in a smile, represent the opening as a single, solid, connected shape, avoiding individual teeth. This shape should flow smoothly and connect to the surrounding facial lines to ensure a cohesive, cuttable design.`,
  [GenerationStyle.STENCIL_V3]: `Generate a CNC-ready stencil illustration from the provided image. Use only solid black vector regions with closed paths. No open lines, no loose islands, no gradients. Simplify all features into connected stencil geometry suitable for laser cutting or Glowforge. Maintain likeness using stylized contour shapes and bold silhouettes.`,
  [GenerationStyle.WOODCUT]: `Transform the given photo into a highly detailed woodcut-style vector artwork. Use bold, clean black carved shapes over a light wooden background texture. Maintain facial likeness while simplifying features into elegant, flowing contour lines. Ensure the final artwork looks suitable for CNC, laser engraving, or stencil cutting—high contrast, no gradients, only solid filled regions and negative space. The final aesthetic should be that of a warm wood panel.`,
};

const THICKNESS_PROMPTS = {
    [LineThickness.THIN]: 'For fine details like hair and clothing curls, apply a thin and delicate line weight. Ensure even these fine lines remain connected and form closed, cuttable shapes without becoming fragile.',
    [LineThickness.MEDIUM]: 'For fine details like hair and clothing curls, use a balanced, medium line weight. This should provide good detail without sacrificing structural integrity.',
    [LineThickness.BOLD]: 'For fine details like hair and clothing curls, use a thick, bold line weight. This will simplify intricate areas into stronger shapes, prioritizing durability for cutting.',
};


export const generateImage = async (
  base64Data: string,
  mimeType: string,
  style: GenerationStyle,
  thickness: LineThickness
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const basePrompt = PROMPTS[style];
  const finalPrompt = 
    style !== GenerationStyle.WOODCUT 
    ? `${basePrompt}\n\n**Line Thickness Instruction:** ${THICKNESS_PROMPTS[thickness]}`
    : basePrompt;

  const textPart = {
    text: finalPrompt,
  };
  
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const generatedPart = response.candidates?.[0]?.content?.parts?.[0];

    if (generatedPart && generatedPart.inlineData) {
      return generatedPart.inlineData.data;
    } else {
      throw new Error("Failed to generate image. The API did not return image data.");
    }
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("There was an issue with the AI model. Please try again.");
  }
};