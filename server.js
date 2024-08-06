require('dotenv').config()
const express = require('express')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const app = express()
const port = process.env.PORT || 3011
const saltRounds = 10
const secretKey = process.env.SECRET_KEY || 'default_secret'

// CORS 설정
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || '43.203.23.195',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'diary2',
}

const pool = mysql.createPool(dbConfig)

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Authorization: Bearer <token>

  if (!token) return res.sendStatus(401) // 토큰이 없으면 401 Unauthorized

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('JWT 인증 실패:', err)
      return res.sendStatus(403) // 토큰이 유효하지 않으면 403 Forbidden
    }
    req.user = user
    next()
  })
}

// 기본 라우트 설정
app.get('/', (req, res) => {
  res.send(
    '<h1>서버에 오신 것을 환영합니다!</h1><p>서버가 정상적으로 실행되고 있습니다.</p>'
  )
})

// 회원가입 엔드포인트
app.post('/signup', async (req, res) => {
  const { name, user_id, password } = req.body

  if (!name || !user_id || !password) {
    return res
      .status(400)
      .json({ isSuccess: false, message: '모든 필드를 입력해 주세요.' })
  }

  try {
    // user_id 중복 확인
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM `user` WHERE `user_id` = ?',
      [user_id]
    )
    if (rows[0].count > 0) {
      return res
        .status(400)
        .json({ isSuccess: false, message: '이미 사용 중인 ID입니다.' })
    }

    // 비밀번호 해싱
    const hash = await bcrypt.hash(password, saltRounds)
    // 데이터베이스에 삽입
    await pool.query(
      'INSERT INTO `user` (`name`, `user_id`, `password`, `coin`, `profile_picture`) VALUES (?, ?, ?, ?, ?)',
      [name, user_id, hash, 5000, null]
    )
    res.status(201).json({ isSuccess: true, message: '회원 가입 성공' })
  } catch (err) {
    console.error('회원 가입 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 로그인 엔드포인트
app.post('/login', async (req, res) => {
  const { user_id, password } = req.body

  if (!user_id || !password) {
    return res
      .status(400)
      .json({ isSuccess: false, message: '모든 필드를 입력해 주세요.' })
  }

  try {
    const [results] = await pool.query(
      'SELECT * FROM `user` WHERE `user_id` = ?',
      [user_id]
    )

    if (results.length === 0) {
      return res
        .status(401)
        .json({ isSuccess: false, message: '사용자를 찾을 수 없습니다' })
    }

    const user = results[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res
        .status(401)
        .json({ isSuccess: false, message: '잘못된 비밀번호' })
    }

    const token = jwt.sign(
      { user_id: user.user_id, name: user.name },
      secretKey,
      { expiresIn: '1h' }
    )
    res.json({
      isSuccess: true,
      message: '로그인 성공',
      token,
      user: { user_id: user.user_id, name: user.name },
    })
  } catch (err) {
    console.error('서버 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 사용자 정보 조회 엔드포인트
app.get('/get-user-info', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT name, user_id, coin, profile_picture FROM user WHERE user_id = ?',
      [req.user.user_id]
    )

    if (results.length === 0) {
      return res
        .status(404)
        .json({ isSuccess: false, message: '사용자를 찾을 수 없습니다.' })
    }

    const user = results[0]
    res.json({
      isSuccess: true,
      user: {
        name: user.name,
        user_id: user.user_id,
        coin: user.coin,
        profilePicture: user.profile_picture
          ? `/uploads/${path.basename(user.profile_picture)}`
          : null,
      },
    })
  } catch (error) {
    console.error('사용자 정보 조회 중 오류 발생:', error)
    res.status(500).json({
      isSuccess: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message,
    })
  }
})

// 비밀번호 변경 엔드포인트
app.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ isSuccess: false, message: '모든 필드를 입력해 주세요' })
  }

  try {
    const [results] = await pool.query(
      'SELECT `password` FROM `user` WHERE `user_id` = ?',
      [req.user.user_id]
    )

    if (results.length === 0) {
      return res
        .status(404)
        .json({ isSuccess: false, message: '사용자를 찾을 수 없습니다' })
    }

    const user = results[0]
    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return res.status(401).json({
        isSuccess: false,
        message: '현재 비밀번호가 올바르지 않습니다',
      })
    }

    const hash = await bcrypt.hash(newPassword, saltRounds)
    await pool.query('UPDATE `user` SET `password` = ? WHERE `user_id` = ?', [
      hash,
      req.user.user_id,
    ])
    res.json({
      isSuccess: true,
      message: '비밀번호가 성공적으로 변경되었습니다',
    })
  } catch (err) {
    console.error('비밀번호 변경 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 다이어리 관련
// 다이어리 상세 조회 엔드포인트
app.get('/get-diary/:id', authenticateToken, async (req, res) => {
  const { id } = req.params

  try {
    const [results] = await pool.query(
      'SELECT * FROM `diary` WHERE `id` = ? AND `user_id` = ?',
      [id, req.user.user_id]
    )
    if (results.length === 0) {
      return res
        .status(404)
        .json({ isSuccess: false, message: '다이어리를 찾을 수 없습니다.' })
    }
    res.json({ isSuccess: true, diary: results[0] })
  } catch (err) {
    console.error('다이어리 상세 조회 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 다이어리 목록 조회 엔드포인트
app.get('/get-diaries', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT * FROM `diary` WHERE `user_id` = ?',
      [req.user.user_id]
    )
    res.json({ isSuccess: true, diaries: results })
  } catch (err) {
    console.error('다이어리 목록 조회 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 다이어리 작성 엔드포인트
app.post('/add-diary', authenticateToken, async (req, res) => {
  const { date, title, one, content } = req.body
  const user_id = req.user.user_id

  try {
    const [result] = await pool.query(
      'INSERT INTO `diary` (`date`, `title`, `one`, `content`, `user_id`) VALUES (?, ?, ?, ?, ?)',
      [date, title, one, content, user_id]
    )

    if (result.affectedRows > 0) {
      res.json({
        isSuccess: true,
        message: '다이어리가 성공적으로 추가되었습니다.',
      })
    } else {
      res.json({ isSuccess: false, message: '다이어리 추가에 실패했습니다.' })
    }
  } catch (err) {
    console.error('다이어리 추가 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 다이어리 삭제 엔드포인트
app.delete('/delete-diary/:id', authenticateToken, async (req, res) => {
  const { id } = req.params

  try {
    const [results] = await pool.query(
      'DELETE FROM `diary` WHERE `id` = ? AND `user_id` = ?',
      [id, req.user.user_id]
    )

    if (results.affectedRows > 0) {
      res.json({
        isSuccess: true,
        message: '다이어리가 성공적으로 삭제되었습니다.',
      })
    } else {
      res
        .status(404)
        .json({ isSuccess: false, message: '다이어리를 찾을 수 없습니다.' })
    }
  } catch (err) {
    console.error('다이어리 삭제 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 다이어리 날짜 확인 엔드포인트
app.get('/checkDiary', authenticateToken, async (req, res) => {
  const { date } = req.query
  const user_id = req.user.user_id

  if (!date) {
    return res
      .status(400)
      .json({ isSuccess: false, message: '날짜를 입력해 주세요.' })
  }

  try {
    const [results] = await pool.query(
      'SELECT * FROM `diary` WHERE `date` = ? AND `user_id` = ?',
      [date, user_id]
    )
    const diaryExists = results.length > 0
    res.json({ isSuccess: true, exists: diaryExists })
  } catch (err) {
    console.error('다이어리 날짜 확인 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 다이어리 수정 엔드포인트
app.put('/edit-diary/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { date, title, one, content } = req.body
  const user_id = req.user.user_id

  if (!date || !title || !one || !content) {
    return res
      .status(400)
      .json({ isSuccess: false, message: '모든 필드를 입력해 주세요.' })
  }

  try {
    // 다이어리 수정 쿼리
    const [result] = await pool.query(
      'UPDATE `diary` SET `date` = ?, `title` = ?, `one` = ?, `content` = ? WHERE `id` = ? AND `user_id` = ?',
      [date, title, one, content, id, user_id]
    )

    if (result.affectedRows > 0) {
      res.json({
        isSuccess: true,
        message: '다이어리가 성공적으로 수정되었습니다.',
      })
    } else {
      res
        .status(404)
        .json({ isSuccess: false, message: '다이어리를 찾을 수 없습니다.' })
    }
  } catch (err) {
    console.error('다이어리 수정 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 색상 저장
app.post('/set-mood-color', authenticateToken, async (req, res) => {
  const { date, color } = req.body
  const userId = req.user.user_id

  if (!date || !color) {
    return res
      .status(400)
      .json({ isSuccess: false, message: '날짜와 색상은 필수입니다.' })
  }

  try {
    // 이미 존재하는 경우 업데이트
    await pool.query(
      'INSERT INTO `calendar` (`user_id`, `date`, `color`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `color` = VALUES(`color`)',
      [userId, date, color]
    )
    res.json({ isSuccess: true, message: '색상이 저장되었습니다.' })
  } catch (err) {
    console.error('색상 저장 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

app.post('/mood-tags', authenticateToken, async (req, res) => {
  const { date, tag } = req.body
  const userId = req.user.user_id

  if (!date || !tag) {
    return res
      .status(400)
      .json({ isSuccess: false, message: '날짜와 태그는 필수입니다.' })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO `calendar` (`user_id`, `date`, `tag`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `tag` = VALUES(`tag`)',
      [userId, date, tag]
    )

    console.log('Query result:', result) // 쿼리 결과 확인
    if (result.affectedRows > 0) {
      res.json({
        isSuccess: true,
        message: '태그가 성공적으로 저장되었습니다.',
      })
    } else {
      res
        .status(500)
        .json({ isSuccess: false, message: '태그 저장에 실패했습니다.' })
    }
  } catch (err) {
    console.error('태그 저장 오류:', err.message)
    res
      .status(500)
      .json({ isSuccess: false, message: '서버 오류', error: err.message })
  }
})

// 태그 조회 API
app.get('/get-user-tags', authenticateToken, async (req, res) => {
  const userId = req.user.user_id

  try {
    const [rows] = await pool.query(
      'SELECT date, tag FROM `calendar` WHERE user_id = ?',
      [userId]
    )

    console.log('Query result:', rows) // 쿼리 결과 확인

    if (rows.length > 0) {
      res.json({ isSuccess: true, data: rows })
    } else {
      res.json({ isSuccess: true, data: [] })
    }
  } catch (err) {
    console.error('태그 조회 오류:', err.message)
    res.status(500).json({
      isSuccess: false,
      message: '태그 데이터 조회 중 오류가 발생했습니다.',
      error: err.message,
    })
  }
})

// 색상 불러오기
app.get('/get-user-calendar', authenticateToken, async (req, res) => {
  const userId = req.user.user_id

  try {
    const [results] = await pool.query(
      'SELECT `date`, `color` FROM `calendar` WHERE `user_id` = ?',
      [userId]
    )
    res.json({ isSuccess: true, data: results })
  } catch (err) {
    console.error('색상 조회 오류:', err)
    res.status(500).json({ isSuccess: false, message: '서버 오류' })
  }
})

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, 'uploads')

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// 정적 파일 제공
app.use('/uploads', express.static(uploadDir))

// 프로필 사진 업로드 엔드포인트
app.post(
  '/upload-profile-picture',
  authenticateToken,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ isSuccess: false, message: '파일이 전송되지 않았습니다.' })
      }

      // 프로필 사진 경로 업데이트
      const profilePicturePath = `/uploads/${req.file.filename}`
      await pool.query(
        'UPDATE `user` SET `profile_picture` = ? WHERE `user_id` = ?',
        [profilePicturePath, req.user.user_id]
      )

      res.json({ isSuccess: true, profilePicture: profilePicturePath })
    } catch (error) {
      console.error('파일 업로드 중 오류 발생:', error)
      res.status(500).json({
        isSuccess: false,
        message: '파일 업로드 중 오류가 발생했습니다.',
      })
    }
  }
)

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`)
})
