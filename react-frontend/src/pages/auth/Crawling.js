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

import { cilSun, cilCloud, cilRain, cilSnowflake } from '@coreui/icons';

//OpenWeather API 호출
  export const fetchHomeData = async () => {
    //백엔드 서버 주소 호출
    const url = `http://localhost:8081/api/weather`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      //날씨 상태별 아이콘 매칭
      let weatherIcon = cilSun;
      const status = data.weather[0].main;

      if(status === 'Clouds') {
        weatherIcon = cilCloud;
        console.log("아이콘 매칭 완료: 구름")
      }
      else if(status === 'Rain' || status === 'Drizzle') weatherIcon = cilRain;
      else if(status === 'Snow') weatherIcon = cilSnowflake;

      return {
        temp: Math.round(data.main.temp),
        desc: data.weather[0].description,
        icon: weatherIcon,
        city: data.name,
      };
    } catch (error) {
      console.error('백엔드 통신 실패:', error);
      return {
        temp: '--',
        desc: '날씨 서버 연결 실패',
        icon: cilSun,
        city: 'Seoul',
        success: false
      };
    };
  };