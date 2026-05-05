package com.ict06.team1_fin_pj.domain.aiSecretary.llm;

import java.util.List;

public record GeminiGenerateResponse(
        List<Candidate> candidates
) {
    public String extractText() {
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }

        Candidate candidate = candidates.get(0);

        if (candidate.content() == null ||
                candidate.content().parts() == null ||
                candidate.content().parts().isEmpty()) {
            return null;
        }

        return candidate.content().parts().get(0).text();
    }

    public record Candidate(
            Content content
    ) {
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