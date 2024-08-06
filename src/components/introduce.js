import React from 'react'
import '../style/mainpage.css'

const Introduce = () => {
  return (
    <div className="mainpage">
      <header
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/img/plz.jpg)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        className="header-opacity"
      >
        <div className="header-content m-5">
          <h1 className="title">마음챙기기 Soul Diary</h1>
          <p className="subtitle">
            <em>"매일의 순간을 기록하세요"</em>
          </p>
        </div>
      </header>

      <div className="content-box">
        <h2 className="section-title">마음챙기기란?</h2>
        <p className="section-description">
          마음챙기기는 일상을 기록하고 소중한 순간들을 간직할 수 있는
          공간입니다. 솔직하게 마음을 표현하고 기록하는 것은 진정한 나를 만나는
          여행의 시작입니다. 글을 쓰며 내면의 감정을 마주하는 과정은 나의 생각과
          느낌을 이해하는 데 큰 도움이 됩니다. 이렇게 적어둔 글들은 시간이
          지나도 나를 지탱해줄 소중한 보물이 될 것입니다. 힐링을 위해 만들어진
          이 페이지에서, 당신의 이야기를 자유롭게 기록해보세요.
        </p>
      </div>

      <section className="main-section">
        <div className="section-content">
          <article className="main-card card">
            <div className="card-image">
              <img
                src={`${process.env.PUBLIC_URL}/img/writer.png`}
                alt="writer"
              />
            </div>
            <div>
              <h2 className="card-title1">일기쓰기</h2>
              <p className="card-description">
                내 마음의 작은 목소리를 듣고 그 속삭임을 새겨넣는 특별한
                순간입니다. 하루의 감정을 무드 트래커에 색으로 표현하고 글로
                의미를 담아내며, 자기 자신을 더 깊이 이해하고 성장할 수
                있습니다. 나의 이야기를 기록하며 소중한 기억과 감정을
                간직해보세요.
              </p>
            </div>
          </article>

          <article className="main-card card">
            <div className="card-image">
              <img src={`${process.env.PUBLIC_URL}/img/mood.png`} alt="mood" />
            </div>
            <div>
              <h2 className="card-title1">무드트래커</h2>
              <p className="card-description">
                일상의 작은 순간들을 색으로 시각화해보세요. 빨간색은 분노일
                수도, 열정일 수도 있고, 노란색은 행복일 수도, 불안일 수도
                있습니다. 그날의 색을 정하고 그 색이 담긴 감정을 일기에
                적어보세요. 매일의 감정을 기록하며 당신의 기분을 깊이 이해하고
                알아가는 소중한 시간을 가질 수 있습니다. 무드 트래커와 함께
                내면의 이야기를 색으로 표현해보세요.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}

export default Introduce
