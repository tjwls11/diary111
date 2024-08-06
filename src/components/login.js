import React, { useState, useEffect } from 'react';
import { useLogin } from '../context/LoginContext';
import { useNavigate, Link } from 'react-router-dom';
import background1 from '../images/background1.jpg';
import background2 from '../images/background2.jpg';
import background3 from '../images/background3.jpg';

const Login = () => {
  const [credentials, setCredentials] = useState({ user_id: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const { login } = useLogin();
  const navigate = useNavigate();

  // 랜덤 배경 이미지 설정
  useEffect(() => {
    const backgrounds = [background1, background2, background3];
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    document.body.style.backgroundImage = `url(${randomBackground})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';

    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
    };
  }, []);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  // 로그인 요청 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
  
    try {
      const response = await fetch('http://43.203.23.195:3011/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
  
      const data = await response.json();
  
      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token); // 토큰 저장
        login(data.user, data.token);
        navigate('/calendar');
      } else {
        setLoginError(data.message || '로그인 실패');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginError('로그인 중 오류가 발생했습니다.');
    }
  };
  

  // 폼 유효성 검사
  const isFormValid = credentials.user_id && credentials.password;

  return (
    <div className="page">
      <div className="title">로그인</div>
      <div className="content">
        <input
          className="input"
          type="text"
          name="user_id"
          placeholder="아이디"
          value={credentials.user_id}
          onChange={handleChange}
        />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="비밀번호"
          value={credentials.password}
          onChange={handleChange}
        />
        <button
          className={`login-button ${isFormValid ? 'enabled' : 'disabled'}`}
          disabled={!isFormValid}
          onClick={handleSubmit}
        >
          로그인
        </button>
      </div>
      {loginError && <p className="error-message">{loginError}</p>}
      <div className="actions">
        <Link to="/signup" className="signup-link">
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default Login;
