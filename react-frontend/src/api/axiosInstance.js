/**
 * @FileName : axiosInstance.js
 * @Description : SpringBoot API 공통 Axios 인스턴스 설정 파일
 *              - baseURL을 통일하여 API 경로 관리
 *              - JWT 토큰을 자동으로 Authorization 헤더에 포함
 *
 *              🔹 주요 역할
 *              1. baseURL 설정 → PATH.API.BASE 사용
 *              2. 요청 시 JWT 토큰 자동 포함 (interceptor)
 *              3. 모든 API 호출을 axios 대신 axiosInstance로 통일
 *
 *              🔹 사용 방법
 *              import axiosInstance from "src/api/axiosInstance";
 *
 *              axiosInstance.get("/user/me");
 *              axiosInstance.post("/evaluation/quiz/submit", payload);
 *
 * @Author : 김다솜
 * @Date : 2026. 05. 01
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.01    김다솜        최초 생성 및 JWT 자동 헤더 처리 추가
 * @ 2026.05.07    김다솜        401 에러 시 Refresh Token을 통한 토큰 자동 재발급(Interceptor) 추가
 * @ 2026.05.07    김다솜        로그인/리프레시 엔드포인트는 401 재발급 분기에서 제외 및 강제 리다이렉트 제거
 */

import axios from 'axios';
import { PATH } from 'src/constants/path';

/**
 * Axios 인스턴스 생성
 *
 * - baseURL을 설정하여 매번 http://localhost:8081/api 를 붙이지 않도록 함
 * - 이후 모든 요청은 상대 경로만 사용 가능
 *
 * 예:
 * axiosInstance.get("/user/me")
 * → 실제 요청: http://localhost:8081/api/user/me
 */
const axiosInstance = axios.create({
    baseURL: PATH.API.BASE,
});

/**
 * 요청 인터셉터 (Request Interceptor)
 *
 * - 모든 API 요청이 서버로 전송되기 전에 실행됨
 * - localStorage에 저장된 JWT 토큰을 읽어 Authorization 헤더에 추가
 *
 * 🔹 동작 흐름
 * 1. 요청 발생
 * 2. interceptor 실행
 * 3. token 존재하면 Authorization 헤더 추가
 * 4. 서버로 요청 전송
 */
axiosInstance.interceptors.request.use((config) => {
    // localStorage에서 AccessToken 조회
    const accessToken = localStorage.getItem("accessToken");

    // 토큰이 존재하면 Authorization 헤더에 추가
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
},
    (error) => {
        // 요청 생성 중 에러 발생 시
        return Promise.reject(error);
    }
);

/**
 * (선택) 응답 인터셉터 (Response Interceptor)
 *
 * - 서버 응답을 받았을 때 실행됨
 * - 현재는 기본 반환만 처리
 *
 * 👉 추후 확장 가능:
 * - 401 (토큰 만료) → 자동 로그아웃
 * - 403 → 권한 없음 처리
 * - 공통 에러 메시지 처리
 */
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';
        const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

        // 401 에러 시 토큰 갱신 시도 (로그인/재발급 API는 제외)
        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                try {
                    // 토큰 재발급 API 호출(/refresh)
                    const res = await axios.post(`${PATH.API.BASE}/auth/refresh`, { refreshToken });
                    const { accessToken: newAccessToken } = res.data;

                    // 새 AccessToken 저장
                    localStorage.setItem("accessToken", newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    // 원래 요청 재시도
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    // RefreshToken도 유효하지 않은 경우
                    // 즉시 강제 이동하지 않고, 호출부에서 에러를 다루도록 위임해 원인 파악을 쉽게 함
                    console.error("토큰 갱신 실패:", refreshError);
                    console.error("401 원본 요청 URL:", requestUrl);
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;