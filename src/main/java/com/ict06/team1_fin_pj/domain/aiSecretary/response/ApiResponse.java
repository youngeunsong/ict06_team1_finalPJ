/**
 * @FileName : ApiResponse.java
 * @Description : aiSecretary 전용 공통 응답 포맷 설정 파일
 * @Author : 송혜진
 * @Date : 2026. 04. 28
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.28    송혜진        최초 생성
 */

package com.ict06.team1_fin_pj.domain.aiSecretary.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;   // 요청 성공 여부
    private String message;    // 응답 메시지
    private T data;            // 실제 응답 데이터

    // 성공 + 데이터 있음
    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    // 성공 + 데이터 없음
    public static ApiResponse<Void> ok(String message) {
        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .data(null)
                .build();
    }

    // 실패
    public static ApiResponse<Void> fail(String message) {
        return ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }
}