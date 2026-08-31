import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini AI initialization with user-agent header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Format seconds into MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Helper to decode HTML entities
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\n+/g, ' ')
    .trim();
}

// Attempt to fetch native YouTube timedtext/captions
async function fetchYouTubeCaptions(videoId: string) {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(videoUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Extract title
    let title = '';
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = decodeHtmlEntities(titleMatch[1].replace(' - YouTube', ''));
    }

    // Look for captionTracks JSON in page source
    const captionTracksRegex = /"captionTracks":\s*(\[.*?\])/;
    const match = html.match(captionTracksRegex);

    if (!match || !match[1]) {
      return { title, segments: null };
    }

    const captionTracks = JSON.parse(match[1]);
    if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
      return { title, segments: null };
    }

    // Prefer English track or first available
    const preferredTrack =
      captionTracks.find((t: { languageCode?: string }) => t.languageCode === 'en' || t.languageCode?.startsWith('en')) ||
      captionTracks[0];

    if (!preferredTrack || !preferredTrack.baseUrl) {
      return { title, segments: null };
    }

    // Fetch JSON3 formatted captions
    const trackUrl = preferredTrack.baseUrl.includes('fmt=')
      ? preferredTrack.baseUrl
      : `${preferredTrack.baseUrl}&fmt=json3`;

    const trackRes = await fetch(trackUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!trackRes.ok) {
      // Fallback: try raw baseUrl (XML format)
      const xmlRes = await fetch(preferredTrack.baseUrl);
      if (xmlRes.ok) {
        const xmlText = await xmlRes.text();
        const textRegex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([^<]+)<\/text>/g;
        const xmlSegments: Array<{ time: string; seconds: number; text: string }> = [];
        let xmlMatch;
        while ((xmlMatch = textRegex.exec(xmlText)) !== null) {
          const startSec = parseFloat(xmlMatch[1]);
          const text = decodeHtmlEntities(xmlMatch[3]);
          if (text) {
            xmlSegments.push({
              time: formatTime(startSec),
              seconds: startSec,
              text,
            });
          }
        }
        if (xmlSegments.length > 0) {
          return { title, segments: xmlSegments, language: preferredTrack.name?.simpleText || 'English' };
        }
      }
      return { title, segments: null };
    }

    const json3Data = await trackRes.json();
    if (!json3Data.events || !Array.isArray(json3Data.events)) {
      return { title, segments: null };
    }

    const segments: Array<{ time: string; seconds: number; text: string }> = [];
    for (const ev of json3Data.events) {
      if (!ev.segs || !Array.isArray(ev.segs)) continue;
      const startMs = ev.tStartMs || 0;
      const startSec = Math.floor(startMs / 1000);
      const text = ev.segs
        .map((s: { utf8?: string }) => s.utf8 || '')
        .join('')
        .replace(/\n/g, ' ')
        .trim();

      if (text && text !== '\n') {
        segments.push({
          time: formatTime(startSec),
          seconds: startSec,
          text: decodeHtmlEntities(text),
        });
      }
    }

    if (segments.length > 0) {
      return {
        title,
        segments,
        language: preferredTrack.name?.simpleText || preferredTrack.languageCode || 'English',
      };
    }

    return { title, segments: null };
  } catch (err) {
    console.error('Error fetching YouTube captions:', err);
    return null;
  }
}

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Transcript Extraction Endpoint
app.post('/api/transcript', async (req: Request, res: Response) => {
  try {
    const { videoId, forceAi = false } = req.body;

    if (!videoId || typeof videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ error: 'A valid 11-character YouTube video ID is required.' });
    }

    let captionResult = null;
    if (!forceAi) {
      captionResult = await fetchYouTubeCaptions(videoId);
    }

    // If native captions were found
    if (captionResult && captionResult.segments && captionResult.segments.length > 0) {
      const segments = captionResult.segments;
      const plainText = segments.map((s) => s.text).join(' ');
      const timestampedText = segments.map((s) => `[${s.time}] ${s.text}`).join('\n');

      return res.json({
        videoId,
        title: captionResult.title || `YouTube Video (${videoId})`,
        source: 'youtube_captions',
        language: captionResult.language || 'English',
        segments,
        plainText,
        timestampedText,
      });
    }

    // If native captions are unavailable or forceAi requested, generate with Gemini API
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(404).json({
        error: 'No automatic captions found on YouTube for this video. To generate an AI transcription, ensure GEMINI_API_KEY is configured in Settings > Secrets.',
        noCaptions: true,
      });
    }

    const prompt = `You are an expert audio & video transcription engine.
Transcribe or provide the complete spoken script and dialogue for the YouTube video with ID "${videoId}".
If you know this video or can derive its speech, provide:
1. Video Title
2. Timestamped spoken dialogue segments with [MM:SS] format
3. A clean comprehensive summary of key takeaways

Respond in strict JSON with the following structure:
{
  "title": "Video Title",
  "segments": [
    { "time": "00:00", "seconds": 0, "text": "Spoken opening dialogue..." },
    { "time": "00:30", "seconds": 30, "text": "Next spoken point..." }
  ],
  "summary": "Concise 2-3 paragraph summary of the video content"
}`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const rawText = aiResponse.text || '{}';
    let parsed: { title?: string; segments?: Array<{ time: string; seconds: number; text: string }>; summary?: string } = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        title: captionResult?.title || `YouTube Video (${videoId})`,
        segments: [{ time: '00:00', seconds: 0, text: rawText }],
      };
    }

    const segments = parsed.segments && parsed.segments.length > 0
      ? parsed.segments
      : [{ time: '00:00', seconds: 0, text: 'No transcription text available for this video.' }];

    const plainText = segments.map((s) => s.text).join(' ');
    const timestampedText = segments.map((s) => `[${s.time || '00:00'}] ${s.text}`).join('\n');

    return res.json({
      videoId,
      title: parsed.title || captionResult?.title || `YouTube Video (${videoId})`,
      source: 'ai_gemini',
      language: 'English (AI Enhanced)',
      segments,
      plainText,
      timestampedText,
      summary: parsed.summary,
    });
  } catch (err: unknown) {
    console.error('Transcript API error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate transcription';
    return res.status(500).json({ error: message });
  }
});

// AI Summarization / Reformatting endpoint
app.post('/api/summarize-transcript', async (req: Request, res: Response) => {
  try {
    const { text, videoTitle } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for summarization.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `Based on the following YouTube video transcript ${videoTitle ? `for "${videoTitle}"` : ''}, generate:
1. A concise Executive Summary (2-3 sentences)
2. Bulleted Key Highlights & Actionable Takeaways
3. Main Topic Chapters

Transcript:
"""
${text.slice(0, 15000)}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    return res.json({
      summary: response.text || 'Unable to generate summary.',
    });
  } catch (err: unknown) {
    console.error('Summarize error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate summary';
    return res.status(500).json({ error: message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
