import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { texts, targetLanguage, targetScriptCode } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "texts array is required" }, { status: 400 });
    }

    if (!targetLanguage || !targetScriptCode) {
      return NextResponse.json({ error: "targetLanguage and targetScriptCode are required" }, { status: 400 });
    }

    // Format for Bhashini pipeline
    const inputData = texts.map((text) => ({ source: text }));

    const requestBody = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: "en",
              targetLanguage: targetLanguage,
              sourceScriptCode: "Latn",
              targetScriptCode: targetScriptCode,
            },
            postProcessors: ["glossary"],
            serviceId: "ai4bharat/indictrans-v2-all-gpu--t4",
          },
        },
      ],
      inputData: {
        input: inputData,
        audio: [{ audioContent: null }],
      },
    };

    const response = await fetch("https://anuvaad-backend.bhashini.co.in/v1/pipeline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bhashini API Error:", errorText);
      return NextResponse.json({ error: "Failed to translate" }, { status: response.status });
    }

    const data = await response.json();
    const output = data.pipelineResponse?.[0]?.output;

    if (!output || !Array.isArray(output)) {
      return NextResponse.json({ error: "Invalid response from Bhashini" }, { status: 500 });
    }

    const translatedTexts = output.map((item: any) => item.target);

    return NextResponse.json({ translatedTexts });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
