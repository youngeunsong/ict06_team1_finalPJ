package com.ict06.team1.finalpj.Authorization;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TempPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("1234"));
    }
}
