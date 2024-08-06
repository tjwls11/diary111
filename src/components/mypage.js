import React, { useState, useEffect } from "react";
import { fetchUserInfo, changePassword, uploadProfilePicture } from "./api/api";

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showFileInput, setShowFileInput] = useState(false); // 파일 입력 필드 표시 상태
  const [showPasswordChange, setShowPasswordChange] = useState(false); // 비밀번호 변경 섹션 표시 상태

  // 사용자 정보를 가져오는 함수
  const getUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "/Login";
      return;
    }

    try {
      const response = await fetchUserInfo(token);
      if (response.isSuccess) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        setError("유저 정보 요청 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("유저 정보 요청 중 오류가 발생했습니다.", error);
      setError("유저 정보 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserInfo(); // 컴포넌트가 마운트될 때 사용자 정보 가져오기
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("모든 필드를 입력하세요.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await changePassword(
        currentPassword,
        newPassword,
        token
      );
      if (response.isSuccess) {
        alert("비밀번호가 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setShowPasswordChange(false); // 비밀번호 변경 필드 숨기기
      } else {
        alert("비밀번호 변경 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 중 오류가 발생했습니다.", error);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const uploadProfilePictureHandler = async () => {
    if (!profilePicture) {
      alert("프로필 사진을 선택하세요.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const response = await uploadProfilePicture(formData, token);

      if (response.isSuccess) {
        alert("프로필 사진이 변경되었습니다.");
        // 프로필 사진이 변경된 후 사용자 정보를 새로 가져옵니다.
        await getUserInfo();
        setProfilePicture(null); // 선택한 파일 초기화
        setShowFileInput(false); // 파일 입력 필드 숨기기
      } else {
        alert("프로필 사진 변경 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("프로필 사진 변경 중 오류가 발생했습니다.", error);
      alert("프로필 사진 변경 중 오류가 발생했습니다.");
    }
  };

  const toggleFileInput = () => {
    setShowFileInput(!showFileInput);
  };

  const togglePasswordChange = () => {
    setShowPasswordChange(!showPasswordChange);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>로그인 후 다시 시도해 주세요.</div>;
  }

  return (
    <div className="mypage">
      <section className="sec-mypage">
        <div className="sec-box">
          <h1 className="sec-mainname">My Page</h1>
          <div className="sec-img">
            <img
              src={
                user.profilePicture
                  ? `http://43.203.23.195:3011${user.profilePicture}`
                  : `${process.env.PUBLIC_URL}/img/mypage.png`
              }
              alt="Profile"
            />
          </div>
          <table>
            <tbody>
              <tr>
                <th className="name">이름</th>
                <td>{user.name || "정보 없음"}</td>
              </tr>
              <tr>
                <th className="name">아이디</th>
                <td>{user.user_id || "정보 없음"}</td>
              </tr>
              <tr>
                <th className="name">내 코인</th>
                <td>{user.coin || "0"}</td>
              </tr>
            </tbody>
          </table>

          <div className="profile-picture-change">
            <h5 onClick={toggleFileInput} style={{ cursor: "pointer" }}>
              프로필 사진 변경
            </h5>
            {showFileInput && (
              <>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
                <button
                  className="Change-button-mypage"
                  onClick={uploadProfilePictureHandler}
                >
                  Upload Profile Picture
                </button>
              </>
            )}
          </div>

          <div className="password-change">
            <h5 onClick={togglePasswordChange} style={{ cursor: "pointer" }}>
              비밀번호 변경
            </h5>
            {showPasswordChange && (
              <>
                <input
                  className="input"
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  className="input"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  className="Change-button-mypage"
                  onClick={handleChangePassword}
                >
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyPage;
