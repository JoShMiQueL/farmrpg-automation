// Base HTTP client for FarmRPG API calls
import * as cheerio from "cheerio";

export interface HttpClientConfig {
  baseUrl: string;
  headers: Record<string, string>;
}

export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
}

export class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = config;
  }

  async get(endpoint: string): Promise<ApiResponse<string>> {
    try {
      const res = await fetch(`${this.config.baseUrl}${endpoint}`, {
        headers: this.config.headers,
        method: "GET"
      });

      if (res.status !== 200) {
        return {
          status: res.status,
          error: `HTTP ${res.status}: Failed to fetch ${endpoint}`
        };
      }

      const data = await res.text();
      return { status: 200, data };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async post(endpoint: string, body?: Record<string, any>): Promise<ApiResponse<string>> {
    try {
      const res = await fetch(`${this.config.baseUrl}${endpoint}`, {
        headers: this.config.headers,
        method: "POST",
        body: body ? JSON.stringify(body) : null
      });

      if (res.status !== 200) {
        return {
          status: res.status,
          error: `HTTP ${res.status}: Failed to post to ${endpoint}`
        };
      }

      const data = await res.text();
      return { status: 200, data };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  parseHtml(html: string) {
    return cheerio.load(html);
  }

  parseNumber(text: string): number {
    return Number.parseInt(text.replace(/,/g, '')) || 0;
  }
}
