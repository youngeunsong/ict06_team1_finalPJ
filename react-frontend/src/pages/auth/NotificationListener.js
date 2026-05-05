import { CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useUser } from 'src/api/UserContext';

const NotificationListener = ({ children }) => {
    const { userInfo } = useUser();
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if(userInfo && userInfo.empNo && token) {
            console.log("알림 구독 시작: ", userInfo.empNo);
            const eventSource = new EventSource(
                `http://localhost:8081/api/noti/subscribe?empNo=${userInfo.empNo}&token=${token}`
            );

            eventSource.onopen = () => console.log("SSE 연결 성공");

            eventSource.addEventListener("notification", (event) => {
                const newNoti = JSON.parse(event.data);

                //1. 토스트 띄우기
                const pushToast = (
                    <CToast
                        key={Date.now()}
                        autohide
                        visible
                        className="shadow-sm"
                        style={{
                            borderRadius: '12px',
                            overflow: 'hidden' // 헤더/바디 색 분리
                        }}
                    >
                        <CToastHeader
                            closeButton
                            style={{
                                backgroundColor: '#321fdb',
                                color: '#ffffff',
                                borderBottom: 'none'
                            }}
                        >
                            <div className="fw-bold me-auto">
                                🔔 {newNoti.title || '새 알림'}
                            </div>
                            <small style={{ color: 'rgba(255,255,255,0.75)' }}>방금 전</small>
                        </CToastHeader>

                        <CToastBody
                            style={{
                                backgroundColor: '#f7f5ff',
                                color: '#212529 !important',
                                fontWeight: 500
                            }}
                            >
                            {newNoti.content}
                        </CToastBody>
                    </CToast>
                );

                //2. 헤더 숫자 +1 이벤트
                const eventNotify = new CustomEvent('newNotification');
                window.dispatchEvent(eventNotify);

                setToasts((prev) => [...prev, pushToast]);
            });

            return() => {
                eventSource.close();
                console.log("SSE 연결 종료");
            };
        }
    }, [userInfo]);
    return (
        <>
            {/* 토스트 렌더링 */}
            <CToaster placement='top-center'>
                {toasts}
            </CToaster>
            {children}
        </>
    );
};

export default NotificationListener;