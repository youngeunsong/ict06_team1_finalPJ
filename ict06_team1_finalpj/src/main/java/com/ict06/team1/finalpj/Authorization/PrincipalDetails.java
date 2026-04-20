package com.ict06.team1.finalpj.Authorization;

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
