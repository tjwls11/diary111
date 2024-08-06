import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import background1 from '../images/background1.jpg'
import background2 from '../images/background2.jpg'
import background3 from '../images/background3.jpg'

function Signup() {
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signupError, setSignupError] = useState('')
  const navigate = useNavigate()

  const isFormValid = useMemo(
    () =>
      name.trim() !== '' &&
      userId.trim() !== '' &&
      password.trim() !== '' &&
      password === confirmPassword,
    [name, userId, password, confirmPassword]
  )

  const backgrounds = useMemo(() => [background1, background2, background3], [])

  useEffect(() => {
    const randomBackground =
      backgrounds[Math.floor(Math.random() * backgrounds.length)]
    document.body.style.backgroundImage = `url(${randomBackground})`
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center'
    document.body.style.backgroundAttachment = 'fixed'

    return () => {
      document.body.style.backgroundImage = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundAttachment = ''
    }
  }, [backgrounds])

  const handleSignup = async () => {
    if (!isFormValid) {
      setSignupError('모든 필드를 올바르게 입력해주세요.')
      return
    }

    const userData = {
      name,
      user_id: userId,
      password,
    }

    try {
      const response = await fetch('http://43.203.23.195:3011/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '서버 오류')
      }

      const result = await response.json()
      if (result.isSuccess) {
        alert('회원가입이 완료되었습니다!')
        navigate('/') // 회원가입 완료 후 로그인 페이지로 이동
      } else {
        setSignupError(result.message)
      }
    } catch (error) {
      console.error('Error:', error)
      setSignupError(error.message || '회원가입 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="page">
      <div className="title">SIGN UP</div>
      <div className="content">
        <input
          className="input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="actions">
        <button
          className={`login-button ${isFormValid ? 'enabled' : ''}`}
          disabled={!isFormValid}
          onClick={handleSignup}
        >
          회원가입
        </button>
        {signupError && <p className="error-message">{signupError}</p>}
        <Link to="/login" className="signup-link">
          로그인
        </Link>
      </div>
    </div>
  )
}

export default Signup
