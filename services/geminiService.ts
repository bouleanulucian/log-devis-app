import { GoogleGenAI, Type } from "@google/genai";
import { QuoteSection, UnitType } from "../types";

// Remove top-level initialization to prevent crash on load
// const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateQuoteFromDescription = async (description: string, currency: string): Promise<QuoteSection[]> => {

  // Check if API key exists
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    // DEMO MODE: Return mock data instead of throwing error
    console.warn("⚠️ Mode Démo activé (Pas de clé API)");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

    return [
      {
        id: crypto.randomUUID(),
        title: "Maçonnerie - Clôture",
        items: [
          {
            id: crypto.randomUUID(),
            type: 'item',
            description: "Fouille en rigole pour fondations de clôture (0.40x0.40m)",
            quantity: 8, // 20ml * 0.4
            unit: 'm3',
            unitPrice: 45,
            vatRate: 20,
            total: 360
          },
          {
            id: crypto.randomUUID(),
            type: 'item',
            description: "Béton de fondation C25/30 armé pour semelle filante",
            quantity: 3.2, // 20ml * 0.4 * 0.4
            unit: 'm3',
            unitPrice: 180,
            vatRate: 20,
            total: 576
          },
          {
            id: crypto.randomUUID(),
            type: 'item',
            description: "Élévation en parpaings creux 20x20x50 (H=2.00m)",
            quantity: 40, // 20ml * 2m
            unit: 'm²',
            unitPrice: 65,
            vatRate: 20,
            total: 2600
          },
          {
            id: crypto.randomUUID(),
            type: 'item',
            description: "Enduit monocouche finition grattée sur 2 faces",
            quantity: 80, // 40m2 * 2
            unit: 'm²',
            unitPrice: 35,
            vatRate: 20,
            total: 2800
          },
          {
            id: crypto.randomUUID(),
            type: 'item',
            description: "Chapeau de mur plat ton pierre",
            quantity: 20,
            unit: 'ml',
            unitPrice: 28,
            vatRate: 20,
            total: 560
          }
        ]
      }
    ];
  }

  // Initialize lazily
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Rôle : Tu es un expert en bâtiment et économiste de la construction qualifié (RGE) en France.
    Tâche : Générer un devis détaillé, technique et chiffré pour des travaux de construction/rénovation basés sur la description suivante :
    
    "${description}"
    
    RÈGLES STRICTES :
    1.  **Langue** : Le contenu doit être EXCLUSIVEMENT en Français professionnel du bâtiment.
    2.  **Prix** : Utilise des prix moyens du marché français actuel (Fourniture + Pose incluse). Sois réaliste.
    3.  **Unités** : Utilise UNIQUEMENT ces unités standard : "m²", "ml", "ens", "h", "u", "forfait".
    4.  **Descriptions** : Sois précis et technique (ex: "Fourniture et pose de plaque de plâtre BA13 sur ossature métallique..." au lieu de juste "Cloison").
    5.  **Structure** : Organise les travaux en sections logiques (Démolition, Maçonnerie, Plomberie, Électricité, Finitions, etc.).
    6.  **Devise** : ${currency}.
    7.  **Format** : Retourne uniquement l'objet JSON respectant le schéma défini.
  `;

  try {
    console.log('🔑 Using API Key:', apiKey.substring(0, 20) + '...');
    console.log('📝 Generating quote for:', description);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Titre de la section (ex: Maçonnerie)" },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING, description: "Description technique de la ligne" },
                    quantity: { type: Type.NUMBER, description: "Quantité estimée" },
                    unit: { type: Type.STRING, description: "Unité (m², ml, ens, u, h, forfait)" },
                    unitPrice: { type: Type.NUMBER, description: "Prix unitaire HT (Fourniture + Pose)" }
                  },
                  required: ["description", "quantity", "unit", "unitPrice"]
                }
              }
            },
            required: ["title", "items"]
          }
        }
      }
    });

    console.log('✅ API Response received:', response);

    const rawData = JSON.parse(response.text || "[]");
    console.log('📊 Parsed data:', rawData);

    // Transform to our internal format with IDs
    return rawData.map((section: any) => ({
      id: crypto.randomUUID(),
      title: section.title,
      items: section.items.map((item: any) => ({
        id: crypto.randomUUID(),
        type: 'item',
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        vatRate: 20, // Default VAT
        total: item.quantity * item.unitPrice
      }))
    }));
  } catch (error: any) {
    console.error("❌ Gemini API Error Details:", error);
    console.error("Error message:", error?.message);
    console.error("Error response:", error?.response);

    // More specific error messages
    if (error?.message?.includes('API key')) {
      throw new Error("🔑 Clé API invalide. Vérifiez votre clé dans .env.local");
    }
    if (error?.message?.includes('quota')) {
      throw new Error("⚠️ Quota API dépassé. Attendez quelques minutes ou vérifiez votre compte Google AI.");
    }
    if (error?.message?.includes('model')) {
      throw new Error("🤖 Modèle non disponible. Vérifiez les permissions de votre clé API.");
    }

    throw new Error(`❌ Erreur API: ${error?.message || 'Erreur inconnue'}. Vérifiez la console (F12) pour plus de détails.`);
  }
};