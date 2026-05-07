/**
 * @FileName : MyPageStyle.js
 * @Description : 마이페이지 화면 스타일 정의
 *                - 프로필 상단 커버 영역
 *                - 프로필 사진 및 사용자 정보 영역
 *                - 계정 상세 정보 표시 요소
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 마이페이지 스타일 분리
 */

export const profileCover = {
    height: '150px',
    background: 'linear-gradient(to right, #ffafbd, #ffc3a0)',
    borderRadius: '0.375rem 0.375rem 0 0'
};

export const profileHeader = {
    marginTop: '-50px'
};

export const profileAvatar = {
    width: '100px',
    height: '100px'
};

export const activeStatusBadge = {
    fontSize: '0.7rem'
};

export const valueGroup = {
    display: 'flex',
    alignItems: 'center'
};

export const accountInfoGroup = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
};