package com.ict06.team1_fin_pj.external.crawling;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CrawlingServiceImpl {

    //application.properties에서 OpenWeather API Key 가져오기
    @Value("${weather.api.key}")
    private String apiKey;

    public String getWeatherData(String city) {
        System.out.println("API key: " + apiKey);
        String url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=metric";

        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, String.class);
    }
}
