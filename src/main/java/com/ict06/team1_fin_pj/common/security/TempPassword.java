package com.ict06.team1_fin_pj.common.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TempPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("1234"));
    }
}
