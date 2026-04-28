package com.ict06.team1_fin_pj.external.crawling;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CrawlingServiceImpl {

    //application.properties에서 OpenWeather API Key 가져오기
    @Value("${weather.api.key}")
    private String apiKey;

    //날씨 데이터 가져오기
    public String getWeatherData(String city) {
        System.out.println("[external > crawling > CrawlingServiceImpl - getWeatherData()]");

        System.out.println("API key: " + apiKey);
        String url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=metric";

        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, String.class);
    }

    //뉴스 데이터 가져오기(크롤링)
    public List<Map<String, String>> getNewsData() {
        System.out.println("[external > crawling > CrawlingServiceImpl - getWeatherData()]");

        String url = "https://news.naver.com/section/105";
        List<Map<String, String>> newsList = new ArrayList<>();

        try {
            //Jsoup으로 위 url의 HTML 긁어오기
            //.userAgent: 봇으로 인식해 차단 방지 역할
            Document doc = Jsoup.connect(url)
                                .userAgent("Mozilla/5.0")
                                .get();

            //뉴스 제목/링크 추출
            Elements elements = doc.select(".sa_text_strong");

            for(int i = 0; i < Math.min(elements.size(), 5); i++) {
                Map<String, String> news = new HashMap<>();
                news.put("title", elements.get(i).text());

                //부모/조상 링크 탐색
                String link = "";
                org.jsoup.nodes.Element el = elements.get(i);

                //위로 올라가면서 a태그 찾기
                while(el != null) {
                    if(el.tagName().equals("a")) {
                        link = el.attr("abs:href");
                        break;
                    }
                    el = el.parent();
                }

                //a태그 없으면 근처 a태그에서 링크 추출
                if(link.isEmpty()) {
                    org.jsoup.nodes.Element nearestA = elements.get(i).selectFirst("a");
                    if(nearestA != null) {
                        link = nearestA.attr("abs:href");
                    }
                }
                System.out.println("뉴스: " + elements.get(i).text() + "/링크: " + link);
                news.put("link", link);
                newsList.add(news);
            }
        } catch(IOException e) {
            System.err.println("뉴스 크롤링 오류: " + e.getMessage());
        }
        return newsList;

    }
}