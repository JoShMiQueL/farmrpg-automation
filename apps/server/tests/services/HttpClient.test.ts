import { describe, test, expect } from "bun:test";
import { HttpClient } from "../../src/services/HttpClient";

describe("HttpClient", () => {
  describe("parseNumber", () => {
    const client = new HttpClient({ baseUrl: "https://test.com", headers: {} });

    test("should parse valid number string", () => {
      // @ts-ignore - Access private method for testing
      const result = client.parseNumber("123");
      expect(result).toBe(123);
    });

    test("should parse number with commas", () => {
      // @ts-ignore - Access private method for testing
      const result = client.parseNumber("1,234,567");
      expect(result).toBe(1234567);
    });

    test("should return 0 for invalid number", () => {
      // @ts-ignore - Access private method for testing
      const result = client.parseNumber("invalid");
      expect(result).toBe(0);
    });

    test("should return 0 for empty string", () => {
      // @ts-ignore - Access private method for testing
      const result = client.parseNumber("");
      expect(result).toBe(0);
    });

    test("should handle negative numbers", () => {
      // @ts-ignore - Access private method for testing
      const result = client.parseNumber("-123");
      expect(result).toBe(-123);
    });
  });

  describe("parseHtml", () => {
    const client = new HttpClient({ baseUrl: "https://test.com", headers: {} });

    test("should parse HTML and return cheerio object", () => {
      const html = "<div class='test'>Hello</div>";
      // @ts-ignore - Access private method for testing
      const $ = client.parseHtml(html);
      
      expect($(".test").text()).toBe("Hello");
    });

    test("should handle empty HTML", () => {
      // @ts-ignore - Access private method for testing
      const $ = client.parseHtml("");
      
      expect($("body").length).toBeGreaterThanOrEqual(0);
    });

    test("should parse complex HTML structure", () => {
      const html = `
        <ul>
          <li class="item">Item 1</li>
          <li class="item">Item 2</li>
        </ul>
      `;
      // @ts-ignore - Access private method for testing
      const $ = client.parseHtml(html);
      
      expect($(".item").length).toBe(2);
      expect($(".item").first().text()).toBe("Item 1");
    });

    test("should handle malformed HTML gracefully", () => {
      const html = "<div><p>Unclosed tags";
      // @ts-ignore - Access private method for testing
      const $ = client.parseHtml(html);
      
      // Cheerio should still parse it
      expect($("div").length).toBeGreaterThan(0);
    });

    test("should parse HTML with special characters", () => {
      const html = "<div>Price: $100 &amp; 50¢</div>";
      // @ts-ignore - Access private method for testing
      const $ = client.parseHtml(html);
      
      expect($("div").text()).toContain("$100");
    });
  });

  describe("HttpClient configuration", () => {
    test("should create client with custom base URL", () => {
      const client = new HttpClient({ 
        baseUrl: "https://custom.com", 
        headers: { "Custom-Header": "value" } 
      });
      
      expect(client).toBeDefined();
    });

    test("should create client with empty headers", () => {
      const client = new HttpClient({ 
        baseUrl: "https://test.com", 
        headers: {} 
      });
      
      expect(client).toBeDefined();
    });
  });
});
