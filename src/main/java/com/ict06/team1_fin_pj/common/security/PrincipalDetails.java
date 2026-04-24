/**
 * @FileName : SecurityConfig.java
 * @Description :
 * @Author : 김다솜
 * @Date : 2026. 04. 18
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.18    김다솜        최초 생성/SSE 구독, 알림 조회, 읽음 처리 API 구현
 */

package com.ict06.team1_fin_pj.common.security;

import com.ict06.team1_fin_pj.common.dto.EmpEntity;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
* Spring Security 인증 위한 객체
* User Entity를 포함해 인증에 필요한 정보 제공(Composition)
*/
@Getter
@RequiredArgsConstructor
public class PrincipalDetails implements UserDetails {

    private final EmpEntity empEntity;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = switch(empEntity.getRoleId()) {
            case 1 -> "ROLE_ADMIN";
            case 2 -> "ROLE_TEAM_LEADER";
            default -> "ROLE_USER";
        };
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return empEntity.getPassword();
    }

    @Override
    public String getUsername() {
        return empEntity.getEmpNo();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return "N".equals(empEntity.getIsDeleted());
    }

}
