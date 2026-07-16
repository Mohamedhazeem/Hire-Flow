import http from "http";

/** Returns a valid EnhancementsResponse JSON matching EnhancementsResponseSchema. */
function mockResponse() {
  return {
    suggestions: [
      {
        type: "bullet_improvement",
        section: "experience",
        original: "Worked on software",
        suggestion: "Architected and delivered a scalable microservices platform serving 50K+ daily users",
        reasoning: "Adds quantified impact and strong action verb",
        priority: "high",
      },
      {
        type: "skill_addition",
        section: "skills",
        suggestion: "TypeScript, React, Node.js",
        reasoning: "Core modern stack for this role",
        priority: "medium",
      },
    ],
    overallScore: 72,
    keyStrengths: ["Clear communication", "Relevant experience"],
    improvementAreas: ["Add quantifiable results", "Include more relevant keywords"],
  };
}

let server: http.Server | null = null;

export function startAiMockServer(port: number): Promise<void> {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(mockResponse()));
        });
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("AI mock server: POST /v1/messages for mock suggestions");
      }
    });

    server.listen(port, () => {
      console.warn(`AI mock server listening on port ${port}`);
      resolve();
    });
  });
}

export function stopAiMockServer(): void {
  if (server) {
    server.close();
    server = null;
  }
}
