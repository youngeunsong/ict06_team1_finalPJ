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
    // localStorage에서 JWT 토큰 조회
    const token = localStorage.getItem("token");

    // 토큰이 존재하면 Authorization 헤더에 추가
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;