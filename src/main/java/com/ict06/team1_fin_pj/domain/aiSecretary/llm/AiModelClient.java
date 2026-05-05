package com.ict06.team1_fin_pj.domain.aiSecretary.llm;

public interface AiModelClient {

    /**
     * AI 모델에 프롬프트를 전달하고 응답 텍스트를 반환한다.
     *
     * 현재 구현체:
     * - GeminiModelClient
     *
     * 추후 확장:
     * - GPT, Claude, Ollama 등을 같은 인터페이스로 추가 가능
     */
    String generateAnswer(String prompt);
}