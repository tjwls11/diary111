import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { addDiary, checkDiaryAvailability } from './api/api'
import '../style/adddiary.css'

function AddDiary() {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [oneLine, setOneLine] = useState('')
  const [diaryContent, setDiaryContent] = useState('')
  const [isDateAvailable, setIsDateAvailable] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const checkDiaryAvailabilityAsync = async () => {
      if (date && token) {
        try {
          const checkData = await checkDiaryAvailability(date, token)
          console.log('다이어리 유효성 검사 응답:', checkData)
          setIsDateAvailable(checkData.exists === false)
        } catch (error) {
          console.error('다이어리 유효성 검사 오류:', error)
          setIsDateAvailable(true)
        }
      }
    }

    checkDiaryAvailabilityAsync()
  }, [date, token])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      alert('오늘 이후의 날짜로는 일기를 작성할 수 없습니다.')
      return
    }

    if (!isDateAvailable) {
      alert('해당 날짜에 이미 작성된 일기가 있습니다.')
      return
    }

    try {
      await addDiary(date, title, diaryContent, oneLine, token)
      alert('일기가 성공적으로 저장되었습니다.')
      setDate('')
      setTitle('')
      setOneLine('')
      setDiaryContent('')
      navigate('/diary')
    } catch (error) {
      console.error('일기 저장 오류:', error)
      alert('일기 저장 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <div className="addContainer container mt-5">
        <div className=" card shadow-lg">
          <h1 className="titleName display-4 text-center mt-3 m-2 mb-5">
            <i className="bi bi-book"></i>
            오늘의 <span className="addSpan">일기</span>
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="DiaryAddDate" className="add-form-label">
                오늘 날짜
              </label>
              <input
                type="date"
                className="form-control"
                id="DiaryAddDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              {!isDateAvailable && (
                <div className="text-danger mt-2">
                  해당 날짜에 이미 작성된 일기가 있습니다.
                </div>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="DiaryTitle" className="add-form-label">
                일기 제목
              </label>
              <input
                type="text"
                className="form-control"
                id="DiaryTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="DiaryOneLine" className="add-form-label">
                한줄평
              </label>
              <input
                type="text"
                className="form-control"
                id="DiaryOneLine"
                value={oneLine}
                onChange={(e) => setOneLine(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label htmlFor="todayDiary" className="add-form-label">
                오늘의 일기
              </label>
              <textarea
                className="form-control"
                id="todayDiary"
                rows="3"
                placeholder="오늘의 일기를 적어보세요."
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
              ></textarea>
            </div>
            <button
              type="submit"
              className="Addbtn btn w-100"
              disabled={!isDateAvailable}
            >
              저장하기
            </button>
          </form>
        </div>
        <div className="text-center">
          <p className="wise">
            <span className="wiseSpan">일기</span>를 쓴다는 것은 누구도 보지
            않을 책에 헌신할 만큼 자신의 삶이
            <span className="wiseSpan"> 가치가 있다</span>고 판단하는 것이다.
            <br />-<span className="wiseSpan">아주 작은 반복의 힘</span>, 로버트
            마우어
          </p>
          <br />
        </div>
      </div>
    </>
  )
}

export default AddDiary
