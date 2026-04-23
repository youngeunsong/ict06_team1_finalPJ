package com.ict06.team1_fin_pj.external.crawling;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CrawlingController {

    private final CrawlingServiceImpl crawlingService;

    //날씨 엔드포인트
    @GetMapping("/weather")
    public ResponseEntity<String> getWeather(@RequestParam(defaultValue = "Seoul") String city) {
        System.out.println("[external > crawling > CrawlingController - getWeather()]");

        String data = crawlingService.getWeatherData(city);

        return ResponseEntity.ok(data);
    }

    //뉴스 엔드포인트
    @GetMapping("/news")
    public ResponseEntity<List<Map<String, String>>> getNews() {
        System.out.println("[external > crawling > CrawlingController - getNews()]");

        //뉴스 리스트 가져오기
        List<Map<String, String>> newsList = crawlingService.getNewsData();

        return ResponseEntity.ok(newsList);
    }
}
