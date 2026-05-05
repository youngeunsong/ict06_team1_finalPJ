package com.ict06.team1_fin_pj.domain.aiSecretary.llm;

import java.util.List;

public record GeminiGenerateRequest(
        List<Content> contents
) {
    public static GeminiGenerateRequest of(String prompt) {
        return new GeminiGenerateRequest(
                List.of(
                        new Content(
                                List.of(new Part(prompt))
                        )
                )
        );
    }

    public record Content(
            List<Part> parts
    ) {
    }

    public record Part(
            String text
    ) {
    }
}

/* Gemini REST 요청 구조
{
  "contents": [
    {
      "parts": [
        {
          "text": "질문"
        }
      ]
    }
  ]
}
* */