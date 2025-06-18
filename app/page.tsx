'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState("");
  const [spaceImage, setSpaceImage] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Fetch weather data
    const fetchWeather = async () => {
      try {
        console.log('Fetching weather data...');
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=6066e72e1697228c30e5b76461e9d6a4&units=metric&lang=kr'
        );
        const data = await response.json();
        console.log('Weather API response:', data);
        
        if (data.cod === '404') {
          setWeather("도시를 찾을 수 없습니다");
          return;
        }
        
        if (data.cod === '401') {
          setWeather("API 키가 유효하지 않습니다");
          return;
        }

        const weatherEmoji = getWeatherEmoji(data.weather[0].id);
        setWeather(`${weatherEmoji} ${data.weather[0].description} (${Math.round(data.main.temp)}°C)`);
      } catch (error) {
        console.error('Weather fetch error:', error);
        setWeather("날씨 정보를 가져올 수 없습니다");
      }
    };

    // Fetch NASA APOD
    const fetchSpaceImage = async () => {
      try {
        // Generate random count between 1 and 10
        const randomCount = Math.floor(Math.random() * 10) + 1;
        const response = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=${randomCount}`
        );
        const data = await response.json();
        // NASA API returns an array when using count parameter
        const imageData = Array.isArray(data) ? data[0] : data;
        setSpaceImage(imageData.url);
      } catch (error) {
        console.error('NASA fetch error:', error);
        setSpaceImage("/space-placeholder.jpg");
      }
    };

    fetchWeather();
    fetchSpaceImage();

    return () => clearInterval(timer);
  }, []);

  const getWeatherEmoji = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 300) return '⛈️';
    if (weatherId >= 300 && weatherId < 400) return '🌧️';
    if (weatherId >= 500 && weatherId < 600) return '🌧️';
    if (weatherId >= 600 && weatherId < 700) return '❄️';
    if (weatherId >= 700 && weatherId < 800) return '🌫️';
    if (weatherId === 800) return '☀️';
    if (weatherId > 800) return '☁️';
    return '🌤️';
  };

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDegrees = (hours % 12) * 30 + minutes * 0.5;
  const minuteDegrees = minutes * 6 + seconds * 0.1;
  const secondDegrees = seconds * 6;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowLoginPopup(false);
        // 로그인 성공 후 처리
      } else {
        if (data.error === 'INVALID_PASSWORD') {
          setLoginError('비밀번호가 일치하지 않습니다.');
        } else if (data.error === 'USER_NOT_FOUND') {
          setLoginError('회원이 아닙니다.');
        } else {
          setLoginError('로그인 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      setLoginError('서버 오류가 발생했습니다.');
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.page}>
      <button 
        onClick={() => setShowLoginPopup(true)}
        className={styles.loginButton}
      >
        로그인
      </button>

      {showLoginPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h2>로그인</h2>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  placeholder="아이디"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="비밀번호"
                  required
                />
              </div>
              {loginError && <div className={styles.error}>{loginError}</div>}
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.loginSubmitButton}>
                  로그인하기
                </button>
                <button 
                  type="button" 
                  className={styles.signupButton}
                  onClick={() => router.push('/sign-up')}
                >
                  회원가입
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <h1 className={styles.title}>조민하의 페이지</h1>

        <div className={styles.infoContainer}>
          <div className={styles.infoBox}>
            <h2>현재 시간</h2>
            <div className={styles.clock}>
              <div className={styles.clockFace}>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={styles.hourMark}
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-81px)`
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
                <div
                  className={styles.hourHand}
                  style={{ transform: `rotate(${hourDegrees}deg)` }}
                />
                <div
                  className={styles.minuteHand}
                  style={{ transform: `rotate(${minuteDegrees}deg)` }}
                />
                <div
                  className={styles.secondHand}
                  style={{ transform: `rotate(${secondDegrees}deg)` }}
                />
                <div className={styles.centerDot} />
              </div>
              <div className={styles.digitalTime}>
                {time.toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className={styles.infoBox}>
            <h2>날씨</h2>
            <p className={styles.weather}>{weather}</p>
          </div>

          <div className={styles.infoBox}>
            <h2>오늘의 천체 사진</h2>
            {spaceImage && (
              <img 
                src={spaceImage} 
                alt="NASA Astronomy Picture of the Day" 
                className={styles.spaceImage}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
