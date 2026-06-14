import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PORT = Number(process.env.KODIAK_AI_PORT || 8787);
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_AI_MODEL = 'gpt-5.4-mini';
const KNOWN_BAD_MODEL_IDS = new Set(['gpt-5.1-mini']);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const raw = readFileSync(filePath, 'utf8');

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), '.env'));
loadEnvFile(resolve(process.cwd(), '.env.local'));

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let rawBody = '';

    request.on('data', (chunk) => {
      rawBody += chunk;

      if (rawBody.length > 1_000_000) {
        request.destroy();
        rejectBody(new Error('Request body is too large.'));
      }
    });

    request.on('end', () => {
      if (!rawBody.trim()) {
        resolveBody({});
        return;
      }

      try {
        resolveBody(JSON.parse(rawBody));
      } catch {
        rejectBody(new Error('Request body must be valid JSON.'));
      }
    });

    request.on('error', rejectBody);
  });
}

function normalizeModel(value) {
  const model = typeof value === 'string' ? value.trim() : '';

  if (!model || KNOWN_BAD_MODEL_IDS.has(model)) {
    return DEFAULT_AI_MODEL;
  }

  return model;
}

function sanitizeOpenAiRequest(body) {
  const record = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const model = normalizeModel(record.model);
  const input = typeof record.input === 'string' && record.input.trim() ? record.input.trim() : '';
  const temperature = typeof record.temperature === 'number' ? record.temperature : 0.7;
  const maxOutputTokens = typeof record.max_output_tokens === 'number' ? record.max_output_tokens : 6500;

  if (!input) {
    throw new Error('Missing AI prompt input.');
  }

  return {
    model,
    input,
    temperature,
    max_output_tokens: Math.min(Math.max(Math.round(maxOutputTokens), 500), 12000),
    store: false
  };
}

async function handleGenerate(request, response) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    sendJson(response, 503, {
      error: {
        message: 'OPENAI_API_KEY is missing on the Kodiak AI gateway. Add it to .env or .env.local and restart npm run dev.'
      }
    });
    return;
  }

  let requestPayload;

  try {
    requestPayload = sanitizeOpenAiRequest(await readJsonBody(request));
  } catch (error) {
    sendJson(response, 400, {
      error: {
        message: error instanceof Error ? error.message : 'Invalid AI request.'
      }
    });
    return;
  }

  try {
    const openAiResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    const responseText = await openAiResponse.text();
    response.writeHead(openAiResponse.status, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': openAiResponse.headers.get('content-type') || 'application/json; charset=utf-8'
    });
    response.end(responseText);
  } catch (error) {
    sendJson(response, 502, {
      error: {
        message: error instanceof Error ? error.message : 'Kodiak AI gateway could not reach OpenAI.'
      }
    });
  }
}

const server = createServer(async (request, response) => {
  const method = request.method || 'GET';
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (method === 'GET' && requestUrl.pathname === '/api/ai/health') {
    sendJson(response, 200, {
      ok: true,
      aiKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
      defaultModel: DEFAULT_AI_MODEL,
      mode: 'kodiak-cloud-ai'
    });
    return;
  }

  if (method === 'POST' && requestUrl.pathname === '/api/ai/generate') {
    await handleGenerate(request, response);
    return;
  }

  sendJson(response, 404, {
    error: {
      message: 'Kodiak AI gateway route not found.'
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const readyState = process.env.OPENAI_API_KEY?.trim() ? 'ready' : 'missing OPENAI_API_KEY';
  console.log(`[Kodiak AI] Gateway listening at http://127.0.0.1:${PORT} (${readyState}, default model ${DEFAULT_AI_MODEL})`);
});
