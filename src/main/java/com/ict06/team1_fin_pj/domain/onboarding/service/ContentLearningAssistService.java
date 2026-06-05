/**
 * @FileName : ContentLearningAssistService.java
 * @Description : ?숈뒿 肄섑뀗痢?AI ?붿빟, ?ъ꽕紐? 吏곸젒 吏덈Ц 泥섎━ ?쒕퉬?? * @Author : 源?ㅼ넑
 * @Date : 2026. 05. 15
 * @Modification_History
 * @
 * @ ?섏젙?쇱옄        ?섏젙??       ?섏젙?댁슜
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.15    源?ㅼ넑        理쒖큹 ?앹꽦 諛?肄섑뀗痢??곌퀎 AI ?숈뒿 ?꾩슦誘?湲곕뒫 異붽?
 * @ 2026.05.18    源?ㅼ넑        紐낆떆??臾몄꽌-肄섑뀗痢??곌껐 ?곗꽑 議고쉶, ?몃? 李멸퀬 留곹겕 蹂닿컯 諛?源⑥쭊 臾몄옄??蹂듦뎄
 */
package com.ict06.team1_fin_pj.domain.onboarding.service;

import com.ict06.team1_fin_pj.common.dto.onboarding.AiContentExplainResponseDto;
import com.ict06.team1_fin_pj.common.dto.onboarding.AiDocumentQuestionResponseDto;
import com.ict06.team1_fin_pj.domain.onboarding.entity.ContentType;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocumentEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.OnContentEntity;
import com.ict06.team1_fin_pj.domain.onboarding.repository.DocumentRepository;
import com.ict06.team1_fin_pj.domain.onboarding.repository.OnContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ContentLearningAssistService {

    private final OnContentRepository onContentRepository;
    private final DocumentRepository documentRepository;
    private final DocumentQuestionAnswerService documentQuestionAnswerService;

    public AiContentExplainResponseDto explainContent(Integer contentId, String mode) {
        OnContentEntity content = getContent(contentId);
        validateExplainableContent(content);

        DocumentEntity document = findLinkedDocument(content);
        String normalizedMode = normalizeMode(mode);
        String prompt = buildPrompt(content, normalizedMode);

        AiDocumentQuestionResponseDto answer = documentQuestionAnswerService.answerQuestion(document.getDocId(), prompt);
        return buildResponse(content, normalizedMode, normalizedMode, document, answer);
    }

    public AiContentExplainResponseDto askQuestion(Integer contentId, String question) {
        OnContentEntity content = getContent(contentId);
        validateExplainableContent(content);

        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("吏덈Ц ?댁슜???낅젰??二쇱꽭??");
        }

        DocumentEntity document = findLinkedDocument(content);
        String prompt = buildQuestionPrompt(content, question.trim());
        AiDocumentQuestionResponseDto answer = documentQuestionAnswerService.answerQuestion(document.getDocId(), prompt);
        return buildResponse(content, "question", question.trim(), document, answer);
    }

    private AiContentExplainResponseDto buildResponse(
            OnContentEntity content,
            String mode,
            String requestHint,
            DocumentEntity document,
            AiDocumentQuestionResponseDto answer
    ) {
        String enrichedAnswer = appendReferenceLinksIfNeeded(content, requestHint, answer.getAnswer());

        return AiContentExplainResponseDto.builder()
                .mode(mode)
                .sourceTitle(document.getTitle())
                .answer(enrichedAnswer)
                .usedChunkCount(answer.getUsedChunkCount())
                .usedChunks(answer.getUsedChunks())
                .build();
    }

    private OnContentEntity getContent(Integer contentId) {
        return onContentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("?숈뒿 肄섑뀗痢좊? 李얠쓣 ???놁뒿?덈떎."));
    }

    private void validateExplainableContent(OnContentEntity content) {
        ContentType type = content.getType();
        if (type != ContentType.PDF && type != ContentType.LINK) {
            throw new IllegalArgumentException("臾몄꽌??肄섑뀗痢좎뿉?쒕쭔 AI ?숈뒿 ?꾩슦誘몃? ?ъ슜?????덉뒿?덈떎.");
        }
    }

    private DocumentEntity findLinkedDocument(OnContentEntity content) {
        DocumentEntity directDocument = findFirst(documentRepository.findByRelatedContentsContentIdWithoutChunks(content.getContentId()))
                .or(() -> findFirst(documentRepository.findByRelatedContentContentIdWithoutChunks(content.getContentId())))
                .orElse(null);
        if (directDocument != null) {
            return directDocument;
        }

        if (content.getPath() != null && !content.getPath().isBlank()) {
            return findFirst(documentRepository.findByFilePathWithoutChunks(content.getPath()))
                    .orElseGet(() -> findFirst(documentRepository.findByTitleIgnoreCaseWithoutChunks(content.getTitle()))
                            .orElseThrow(() -> new IllegalArgumentException("?곌껐??臾몄꽌瑜?李얠쓣 ???놁뼱 AI ?숈뒿 ?꾩슦誘몃? ?ъ슜?????놁뒿?덈떎.")));
        }

        return findFirst(documentRepository.findByTitleIgnoreCaseWithoutChunks(content.getTitle()))
                .orElseThrow(() -> new IllegalArgumentException("?곌껐??臾몄꽌瑜?李얠쓣 ???놁뼱 AI ?숈뒿 ?꾩슦誘몃? ?ъ슜?????놁뒿?덈떎."));
    }

    private Optional<DocumentEntity> findFirst(List<DocumentEntity> documents) {
        return documents == null || documents.isEmpty()
                ? Optional.empty()
                : Optional.of(documents.get(0));
    }

    private String normalizeMode(String mode) {
        if (mode == null || mode.isBlank()) {
            return "summary";
        }
        return mode.trim().toLowerCase();
    }

    private String buildPrompt(OnContentEntity content, String mode) {
        if ("simple".equals(mode)) {
            return """
                    This is an onboarding study document.
                    Document title: '%s'

                    Task:
                    1. Pick only difficult terms, technical concepts, or process concepts that a beginner may struggle with.
                    2. Explain each item in practical, easy Korean.
                    3. Create 3 to 5 bullet points.
                    4. Do not invent anything that is not supported by the document.
                    5. Answer in Korean.
                    """.formatted(content.getTitle());
        }

        return """
                This is an onboarding study document.
                Document title: '%s'

                Task:
                1. Summarize the document into 4 to 6 meaningful bullet points.
                2. Cover purpose, key concepts, important procedures, and cautions when available.
                3. Prefer practical points that help a new employee understand what to do.
                4. Do not invent anything that is not supported by the document.
                5. Answer in Korean.
                """.formatted(content.getTitle());
    }

    private String buildQuestionPrompt(OnContentEntity content, String question) {
        return """
                This is a user question about an onboarding study document.
                Document title: '%s'
                User question: %s

                Answer rules:
                1. Use document evidence first.
                2. If the question asks about procedure, order, caution, important point, or practical flow, answer with 2 to 4 bullet points.
                3. If document evidence is thin, say so briefly and provide the best supported answer.
                4. Avoid generic theory-first answers.
                5. Answer in Korean.
                """.formatted(content.getTitle(), question);
    }

    private String appendReferenceLinksIfNeeded(OnContentEntity content, String requestHint, String answer) {
        if (answer == null || answer.isBlank() || !isLowConfidenceAnswer(answer)) {
            return answer;
        }

        String referenceLinks = buildReferenceLinks(content, requestHint);
        if (referenceLinks.isBlank()) {
            return answer;
        }

        return answer + "\n\n愿??李멸퀬 URL\n" + referenceLinks;
    }

    private boolean isLowConfidenceAnswer(String answer) {
        String normalized = answer.replaceAll("\\s+", "");
        return normalized.contains("臾몄꽌?먯꽌?뺤씤?좎닔??)
                || normalized.contains("?먮즺媛遺議?)
                || normalized.contains("紐낆떆?곸쑝濡쒖뼵湲됰릺吏??)
                || normalized.contains("?뺥솗?쒕떟蹂?댁뼱??)
                || normalized.contains("洹쇨굅媛異⑸텇?섏???);
    }

    private String buildReferenceLinks(OnContentEntity content, String requestHint) {
        String source = ((content.getTitle() == null ? "" : content.getTitle()) + " "
                + (content.getCategory() == null ? "" : content.getCategory()) + " "
                + (content.getSubCategory() == null ? "" : content.getSubCategory()) + " "
                + (requestHint == null ? "" : requestHint)).toLowerCase();

        if (source.contains("spring")) {
            return """
                    - Spring Framework ?덉쇅 泥섎━ 臾몄꽌: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html
                    - Spring Boot ?ㅻ쪟 泥섎━ 臾몄꽌: https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.spring-mvc.error-handling
                    """.trim();
        }
        if (source.contains("react")) {
            return """
                    - React ?곹깭 愿由? https://react.dev/learn/managing-state
                    - React 而댄룷?뚰듃 媛??곹깭 怨듭쑀: https://react.dev/learn/sharing-state-between-components
                    """.trim();
        }
        if (source.contains("figma") || source.contains("design")) {
            return """
                    - Figma Help Center: https://help.figma.com/
                    - W3C Design Systems: https://design-system.w3.org/
                    """.trim();
        }
        if (source.contains("accessibility") || source.contains("?묎렐??) || source.contains("a11y")) {
            return """
                    - MDN ?묎렐??媛?대뱶: https://developer.mozilla.org/ko/docs/Learn/Accessibility
                    - WAI ?묎렐???뚭컻: https://www.w3.org/WAI/fundamentals/accessibility-intro/
                    """.trim();
        }
        if (source.contains("aws")) {
            return """
                    - AWS 媛쒖슂 臾몄꽌: https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html
                    - AWS Documentation: https://docs.aws.amazon.com/
                    """.trim();
        }
        if (source.contains("security") || source.contains("蹂댁븞")) {
            return """
                    - KISA 蹂댄샇?섎씪: https://www.boho.or.kr/
                    - OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
                    """.trim();
        }

        return "";
    }
}

