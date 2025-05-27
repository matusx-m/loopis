import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const res = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        api_key: process.env.SERP_API_KEY,
        engine: "google",
      },
    });

    const answerBox = res.data.answer_box?.answer || res.data.answer_box?.snippet || "No quick answer found.";
    return NextResponse.json({ result: answerBox });
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ error: "Failed to fetch from SerpAPI" }, { status: 500 });
  }
}
