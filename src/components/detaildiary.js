import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.css'; // FontAwesome 사용


// 날짜 형식을 'yyyy-mm-dd'로 변환하는 헬퍼 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더합니다.
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DetailDiary = () => {
  const { id } = useParams(); // URL 파라미터에서 일기 ID 가져오기
  const [diary, setDiary] = useState(null);

  useEffect(() => {
    const fetchDiary = async () => {
      const token = localStorage.getItem('token'); // 저장된 JWT 토큰 가져오기
      try {
        const response = await fetch(`http://43.203.23.195:3011/get-diary/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}` // JWT 토큰을 Authorization 헤더에 포함
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setDiary(data.diary || {});
      } catch (error) {
        console.error('Error fetching diary:', error);
      }
    };

    fetchDiary();
  }, [id]);

  if (!diary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5 border border-secondary rounded-3 p-5 pb-7 shadow p-3 mb-5">
      <div className="header-container d-flex justify-content-between align-items-center">
        <h1 className="detailH1 display-4 mt-4 fw-bold">
          <i className="fa-solid fa-magnifying-glass" style={{ color: '#9ad6a8' }}></i>
          그날의 <span style={{ color: '#9ad6a8' }}>일기</span>
        </h1>
        <Link
          to="/diary"
          className="linkToDiary btn mt-4 mb-2 text-white text-decoration-none"
          style={{ backgroundColor: '#9ad6a8' }}
        >
          홈으로
        </Link>
      </div>
      <div id="book-detail" className="down">
        <div className="detail-item m-4 mt-5">
          <h2 className="fw-bold fs-3 mb-3">{diary.title}</h2>
          <p>{diary.content}</p>
          <p><strong>날짜:</strong> {formatDate(diary.date)}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailDiary;
