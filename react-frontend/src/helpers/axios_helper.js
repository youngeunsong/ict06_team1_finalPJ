/**
 * @FileName : axios_helper.js
 * @Description : 백엔드와 REST API로 통신 가능하도록 만드는 코드입니다. 
 *          수업시간에 배운 'boot_react_jwt' 예제에서 가져왔습니다. 
 * @Author : 송영은
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    송영은       최초 생성
*/

import React from 'react';
import axios from 'axios'; // npm i axios

axios.defaults.baseURL = 'http://localhost:8081'; // 백엔드 주소 
axios.defaults.headers.post["content-type"] = 'application/json';  

// backend와 통신
// 로그인 완료 시 JWT를 저장한다. 

// 한 스크립트에서 여러 개 export하고 싶을 때 아래와 같은 방식으로 작성
export const getAuthToken = () => {
    return window.localStorage.getItem("auth_token"); 
}

// 로그인 성공 시 넘겨준 토큰을 받는다. 
export const setAuthToken = (token) => {
    
    // 토큰이 존재하면 localStorage에 저장
    if(token) {
        window.localStorage.setItem("auth_token", token); 
    }
    // 토큰이 없으면 (null 또는 undefined) localStorage에서 삭제 
    else{
        window.localStorage.removeItem("auth_token");
    }
}

// backend와 통신하는 메써드 
export const request = (method, url, data) => {

    const token = localStorage.getItem('auth_token'); 
    // const headers = token ? {Authorization: `Bearer ${token}`}: {}; 
    const headers = (token && token !== null && token !== 'undefined')
                    ? {Authorization: `Bearer ${token}`}
                    : {}; 
    
    console.log('axios !!!!'); 
    console.log('method : ', method); 
    console.log('url: ', url); 
    console.log('data: ', data); 

    // 메서드를 대문자로 변환하여 비교
    const upperMethod = method.toUpperCase();

    return axios ({
        method: method, 
        headers: headers,
        url: url, 
        // data: data
        // ✅ GET 또는 DELETE일 때는 params(쿼리 스트링)로 전달
        params: (upperMethod === 'GET' || upperMethod === 'DELETE') ? data : null,
        // ✅ POST, PUT, PATCH일 때는 data(Body)로 전달
        data: (upperMethod !== 'GET' && upperMethod !== 'DELETE') ? data : null
    });
};


