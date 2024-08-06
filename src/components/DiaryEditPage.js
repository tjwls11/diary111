import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchDiary, checkDiaryAvailability, editDiary } from './api/api'
import 'bootstrap/dist/css/bootstrap.min.css'

const DiaryEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [diary, setDiary] = useState({ title: '', date: '', content: '' })
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  const fetchDiaryData = useCallback(async () => {
    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    try {
      const data = await fetchDiary(id, token)

      // 날짜를 yyyy-MM-dd 포맷으로 변환
      const formattedDate = new Date(data.date).toISOString().split('T')[0]
      setDiary({ ...data, date: formattedDate })
    } catch (error) {
      console.error('Error fetching diary:', error)
      setError('일기 정보를 불러오는 중 오류가 발생했습니다.')
    }
  }, [id, token])

  useEffect(() => {
    fetchDiaryData()
  }, [fetchDiaryData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setDiary({ ...diary, [name]: value })
  }

  const handleSaveEdit = async () => {
    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    try {
      // Check if a diary entry already exists for the selected date
      const existingDiary = await checkDiaryAvailability(diary.date, token)

      if (existingDiary.length > 0 && existingDiary[0].id !== id) {
        setError('해당 날짜에 이미 일기가 존재합니다.')
        return
      }

      // Proceed to update the diary entry
      await editDiary(id, diary, token)
      navigate(`/detail-diary/${id}`) // Navigate to the specific diary page after successful update
    } catch (error) {
      console.error('Error editing diary:', error)
      setError('일기 정보를 저장하는 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="container mt-5 border border-secondary rounded-3 p-5 pb-7 shadow p-3 mb-5 bg-light">
      <div className="header-container d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-4 fw-bold">
          <i className="fa-solid fa-pen-nib" style={{ color: '#5f846e' }}></i>
          일기 <span style={{ color: '#5f846e' }}>수정</span>
        </h1>
        <a
          href="/diary"
          className="btn btn-success text-white"
          style={{ backgroundColor: '#5f846e', borderColor: '#5f846e' }}
        >
          홈으로
        </a>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form>
        <div className="mb-4">
          <label htmlFor="title" className="form-label">
            제목
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={diary.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="form-label">
            날짜
          </label>
          <input
            type="date"
            className="form-control"
            id="date"
            name="date"
            value={diary.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="form-label">
            내용
          </label>
          <textarea
            className="form-control"
            id="content"
            name="content"
            value={diary.content}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
        </div>
        <button
          type="button"
          className="btn btn-success text-white mt-4"
          style={{ backgroundColor: '#5f846e', borderColor: '#5f846e' }}
          onClick={handleSaveEdit}
        >
          저장
        </button>
      </form>
    </div>
  )
}

export default DiaryEditPage
