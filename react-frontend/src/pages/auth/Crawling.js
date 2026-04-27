/**
 * @FileName : Crawling.js
 * @Description : 외부 API 및 크롤링 데이터 처리를 위한 서비스 파일
 * @Author : 김다솜
 * @Date : 2026. 04. 22
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.22    김다솜        최초 생성/OpenWeather API 연동 및 위젯 반영
*/

import axios from 'axios';
import { cilSun, cilCloud, cilRain, cilSnowflake } from '@coreui/icons';

//OpenWeather API 호출
  export const fetchHomeData = async () => {
    //백엔드 서버 주소
    const weatherUrl = `http://localhost:8081/api/weather`;
    const newsUrl = `http://localhost:8081/api/news`;

    try {
      //1. 날씨, 뉴스 데이터 호출
      const [weatherRes, newsRes] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(newsUrl)
      ]);

      //2. 날씨 데이터 파싱
      //백엔드에서 String(JSON문자열)으로 주면 JSON.parse
      const weatherData = typeof weatherRes.data === 'string' ? JSON.parse(weatherRes.data) : weatherRes.data;

      //3. 날씨 아이콘 매칭
      let weatherIcon = cilSun;
      const status = weatherData.weather[0].main;

      if(status.includes('Clouds')) {
        weatherIcon = cilCloud;
        console.log("아이콘 매칭 완료: 구름")
      }
      else if(status.includes('Rain') || status.includes('Drizzle')) {
        weatherIcon = cilRain;
      }
      else if(status.includes('Snow')) {
        weatherIcon = cilSnowflake;
      }
      else if(status.includes('Clear')) {
        weatherIcon = cilSun;
      }
      
      //4. 리턴(날씨, 뉴스리스트 5개)
      return {
        temp: Math.round(weatherData.main.temp),
        desc: weatherData.weather[0].description,
        icon: weatherIcon,
        city: weatherData.name,
        newsList: newsRes.data
      };
    } catch (error) {
      console.error('백엔드 통신 실패:', error);
      return {
        temp: '--',
        desc: '연결 실패',
        icon: cilSun,
        city: '--',
        newsList: [{title: '뉴스를 불러올 수 없습니다.', link: '#'}],
        success: false
      };
    }
  };