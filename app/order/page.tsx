'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// 메뉴 목록: '라이브 쌀국수' 제거 완료 (치즈 오믈렛, 팬케이크만 구성)
const MENUS = [
  { id: 'omelet', name: '치즈 오믈렛' },
  { id: 'pancake', name: '팬케이크' },
];

function OrderContent() {
  const searchParams = useSearchParams();
  const table = searchParams.get('table') || '1';

  // 메뉴별 선택 수량 상태
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    omelet: 0,
    pancake: 0,
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 주문 완료 팝업 상태
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedOrders = localStorage.getItem('guest_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (e) {
      console.error('주문 불러오기 실패:', e);
    }
  }, []);

  // 수량 변경 함수 (최대 2개 제한)
  const handleQuantityChange = (menuId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[menuId] || 0;
      const updated = current + delta;
      if (updated < 0 || updated > 2) return prev;
      return { ...prev, [menuId]: updated };
    });
  };

  // 주문 전송
  const handleOrderSubmit = () => {
    const selectedItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const menuInfo = MENUS.find((m) => m.id === id);
        return { name: menuInfo?.name, quantity: qty };
      });

    if (selectedItems.length === 0) {
      alert('주문할 메뉴와 수량을 선택해주세요.');
      return;
    }

    const newOrder = {
      table,
      items: selectedItems,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // localStorage 저장 (주방 연동용)
    const existingOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('guest_orders', JSON.stringify(updatedOrders));

    setOrders(updatedOrders);
    setLatestOrder(newOrder);
    setIsPopupOpen(true);

    // 수량 초기화
    setQuantities({ omelet: 0, pancake: 0 });
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-md mx-auto flex flex-col justify-between relative">
      <div>
        {/* 상단 타이틀 */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🍽️ 조식 뷔페 주문
          </h1>
          <p className="text-lg font-semibold text-blue-600 mt-1">
            테이블 번호: {table}번
          </p>
        </div>

        {/* 메뉴 선택 영역 */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            메뉴 선택
          </h2>
          
          <div className="space-y-3">
            {MENUS.map((menu) => {
              const qty = quantities[menu.id] || 0;
              return (
                <div
                  key={menu.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
                >
                  <span className="font-bold text-gray-800 text-lg">{menu.name}</span>
                  
                  {/* 수량 조절 버튼 (0 ~ 2개 제한) */}
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(menu.id, -1)}
                      disabled={qty === 0}
                      className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm font-bold text-gray-600 active:bg-gray-100 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-lg text-gray-800">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(menu.id, 1)}
                      disabled={qty >= 2}
                      className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm font-bold text-blue-600 active:bg-gray-100 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 주문 전송 버튼 */}
        <button
          onClick={handleOrderSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-lg mb-6"
        >
          주문 전송하기
        </button>

        {/* 요청하신 하단 안내 문구 영역 */}
        <div className="bg-gray-100/80 rounded-xl p-4 text-xs text-gray-600 space-y-1.5 border border-gray-200/60 mb-6">
          <p className="leading-relaxed font-medium">
            ※ 1회 주문 시 최대 2개까지 선택 가능하며 수령 완료 후 추가 주문이 가능합니다.
          </p>
          <p className="leading-relaxed font-medium text-rose-600">
            ※ 쌀국수는 라이브 현장에서 주문 부탁드립니다.
          </p>
        </div>

        {/* 내 주문 현황 */}
        <div className="border-t pt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            📋 내 주문 현황
          </h2>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400">주문 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">{order.time} 접수</span>
                    <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                      주문접수
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {order.items.map((item: any, i: number) => (
                      <li key={i} className="text-sm font-medium text-gray-700 flex justify-between">
                        <span>{item.name}</span>
                        <span className="font-bold text-gray-900">{item.quantity}개</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 주문 완료 팝업 */}
      {isPopupOpen && latestOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ✅
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-1">주문이 완료되었습니다!</h3>
            <p className="text-xs text-gray-500 mb-6">주방으로 주문이 안전하게 전송되었습니다.</p>

            <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100 mb-6">
              <div className="flex justify-between text-xs text-gray-400 border-b pb-2 mb-2">
                <span>테이블 {latestOrder.table}번</span>
                <span>{latestOrder.time}</span>
              </div>
              <ul className="space-y-1.5">
                {latestOrder.items.map((item: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm font-bold text-gray-700">
                    <span>{item.name}</span>
                    <span className="text-rose-600">{item.quantity}개</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setIsPopupOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">로딩 중...</div>}>
      <OrderContent />
    </Suspense>
  );
}
