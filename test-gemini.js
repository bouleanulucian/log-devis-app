const apiKey = "AIzaSyBJ0ainvo7AEtyFXayaglRgZZic7qtdmTA";

import { GoogleGenAI } from "@google/genai";

async function testGemini() {
    console.log("Testing Gemini API with key:", apiKey);
    try {
        const ai = new GoogleGenAI({ apiKey });
        console.log("Trying 'gemini-2.0-flash'...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: "Hello",
        });
        console.log("✅ Success with gemini-2.0-flash! Response:", response.text);
    } catch (error) {
        console.error("❌ Error with gemini-2.0-flash:", error.message);
    }
}

testGemini();
