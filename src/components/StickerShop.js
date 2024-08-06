import React, { useState, useEffect } from 'react';
import { fetchStickers, purchaseSticker, fetchUserStickers } from './api/api';
import StickerItem from './StickerItem';
import { useNavigate } from 'react-router-dom';

const StickerShop = () => {
  const [stickers, setStickers] = useState([]);
  const [userStickers, setUserStickers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getStickers = async () => {
      try {
        const data = await fetchStickers();
        setStickers(data);
      } catch (error) {
        console.error('스티커 목록을 불러오는 중 오류가 발생했습니다.', error);
      }
    };

    const getUserStickers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const userStickers = await fetchUserStickers(token);
        setUserStickers(userStickers);
      } catch (error) {
        console.error('유저 스티커 목록을 불러오는 중 오류가 발생했습니다.', error);
      }
    };

    getStickers();
    getUserStickers();
  }, []);

  const handlePurchase = async (sticker) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('로그인 후 구매를 진행해주세요.');
        navigate('/login');
        return;
      }

      const isStickerOwned = userStickers.some(item => item.sticker_id === sticker.sticker_id);
      if (isStickerOwned) {
        alert(`이미 소유한 스티커 '${sticker.name}'입니다.`);
        return;
      }

      const purchaseResponse = await purchaseSticker(sticker.sticker_id, token);
      if (purchaseResponse.isSuccess) {
        alert(`스티커 '${sticker.name}' 구매 완료`);
        setUserStickers(prev => [...prev, { sticker_id: sticker.sticker_id, name: sticker.name }]);
      } else {
        alert(`구매 실패: ${purchaseResponse.message}`);
      }
    } catch (error) {
      console.error('구매 오류:', error);
      alert('구매 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h1>스티커 샵</h1>
      <div className="sticker-list">
        {stickers.map(sticker => {
          const isOwned = userStickers.some(userSticker => userSticker.sticker_id === sticker.sticker_id);

          return (
            <div key={sticker.sticker_id} className="sticker-item">
              <StickerItem sticker={sticker} />
              <button onClick={() => handlePurchase(sticker)} disabled={isOwned}>
                {isOwned ? '소유한 스티커' : '구매하기'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StickerShop;
