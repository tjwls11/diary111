import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../context/LoginContext'; // LoginContext에서 훅을 가져옵니다.

const Navbar = () => {
  const { user, logout } = useLogin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = (event) => {
    if (user) {
      event.preventDefault(); // 기본 링크 동작 방지
    } else {
      navigate('/'); // 로그인하지 않은 경우에만 홈 페이지로 이동
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container-fluid">
        <Link className="navbar-brand fs-2 mx-1" to="/" onClick={handleLogoClick}>
          <img
            src={`${process.env.PUBLIC_URL}/img/logo.png`}
            alt="writer"
            className="logo-img"
          />
          마음챙기기
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/diary">
                    Diary
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/calendar">
                    Mood Tracker
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/mypage">
                    My Page
                  </Link>
                </li>
                <li className="nav-button-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item d-flex align-items-center">
                    <Link className="nav-link me-3" to="/login">
                        Login
                    </Link>
                    <Link className="nav-link" to="/signup">
                          Signup
                     </Link>
                </li>

              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
