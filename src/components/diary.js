import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../style/diary.css'; // CSS 수정 사항이 포함된 파일

// 날짜 형식을 'yyyy-mm-dd'로 변환하는 헬퍼 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더합니다.
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Diary = () => {
  const [diaries, setDiaries] = useState([]);
  const [quote, setQuote] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 7;
  const token = localStorage.getItem('token');

  const fetchDiaries = useCallback(async () => {
    try {
      const response = await fetch('http://43.203.23.195:3011/get-diaries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const diariesList = data.diaries || [];
      const sortedDiaries = diariesList.sort((a, b) => new Date(b.date) - new Date(a.date));
      const total = Math.ceil(sortedDiaries.length / itemsPerPage);

      setDiaries(sortedDiaries);
      setTotalPages(total);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching diaries:', error);
    }
  }, [token]);

  const fetchRandomQuote = useCallback(async () => {
    try {
      const response = await fetch('http://43.203.23.195:3011/random-quote');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      console.error('Error fetching random quote:', error);
    }
  }, []);

  useEffect(() => {
    fetchDiaries();
    fetchRandomQuote();
  }, [fetchDiaries, fetchRandomQuote]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://43.203.23.195:3011/delete-diary/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchDiaries();
      } else {
        console.error('Failed to delete the diary:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting diary:', error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const currentDiaries = diaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <br />
      <div className="container mt-5 text-center">
        <h1 className="display-4 mt-4 fw-bold">
          <i className="bi bi-book"></i>
          오늘의<span className="spantag"> 일기</span>
        </h1>
        <br />
        <br />
        <div className="d-grid gap-2">
          <Link
            to="/add-diary"
            className="text-white fw-bold text-decoration-none btn mb-2"
          >
            글쓰기
          </Link>
        </div>
        <table className="table table-striped mt-4 mb-5">
          <thead className="custom-thead">
            <tr>
              <th className="text-center">제목</th>
              <th className="text-center">날짜</th>
              <th className="text-center">삭제</th>
            </tr>
          </thead>
          <tbody>
            {currentDiaries.map((diary) => (
              <tr key={diary.id}>
                <td className="text-center">
                  <Link
                    to={`/detail-diary/${diary.id}`}
                    className="text-decoration-none"
                  >
                    {diary.title}
                  </Link>
                </td>
                <td className="text-center">{formatDate(diary.date)}</td>
                <td className="text-center">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(diary.id)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* 페이지 네비게이션 */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ◀
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                className={`btn btn-outline-secondary mx-1 ${currentPage === page + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </button>
            ))}
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              ▶
            </button>
          </div>
        )}
        {/* 랜덤 인용구 */}
        {quote && (
          <div className="quote-container mt-4">
            <blockquote className="blockquote text-center">
              <p className="mb-0">{quote.text}</p>
              <footer className="blockquote-footer">{quote.author}</footer>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
