package com.ict06.team1_fin_pj.external.crawling;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http//localhost:3000")
public class CrawlingController {

    private final CrawlingServiceImpl crawlingService;

    @GetMapping("/weather")
    public ResponseEntity<String> getWeather() {
        System.out.println("[external > crawling > CrawlingController - getWeather()]");

        //날씨 지역 기본값 설정
        String city = "Seoul";
        String data = crawlingService.getWeatherData(city);

        return ResponseEntity.ok(data);
    }
}
