'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// 메뉴 목록 (이름과 고유 ID)
const MENUS = [
  { id: 'omelet', name: '치즈 오믈렛' },
  { id: 'pancake', name: '팬케이크' },
];

export default function OrderPage() {
  const searchParams = useSearchParams();
  const table = searchParams.get('table') || '1';

  // 메뉴별 수량 관리 (예: { omelet: 1, noodle: 0, pancake: 2 })
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    omelet: 0,
    noodle: 0,
    pancake: 0,
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 수량 변경 함수 (최소 0개, 최대 2개 제한)
  const handleQuantityChange = (menuId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[menuId] || 0;
      const updated = current + delta;
      if (updated < 0 || updated > 2) return prev; // 0개 미만, 2개 초과 방지
      return { ...prev, [menuId]: updated };
    });
  };

  // 주문 전송하기
  const handleOrderSubmit = () => {
    // 선택된 수량이 하나라도 있는지 확인
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

    setOrders((prev) => [newOrder, ...prev]);

    // 주문 후 수량 초기화
    setQuantities({ omelet: 0, noodle: 0, pancake: 0 });
    alert('주문이 완료되었습니다!');
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-md mx-auto flex flex-col justify-between">
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

        {/* 메뉴 선택 및 수량 조절 영역 */}
        <div className="mb-6">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              메뉴 선택
            </h2>
            {/* 수정된 안내 문구 */}
            <p className="text-xs font-medium text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100 leading-relaxed">
              💡 1회 주문 시 최대 2개까지 구매 가능합니다.<br />
              주문 완료 후 재주문 가능합니다.
            </p>
          </div>
          
          <div className="space-y-3">
            {MENUS.map((menu) => {
              const qty = quantities[menu.id] || 0;
              return (
                <div
                  key={menu.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
                >
                  <span className="font-bold text-gray-800 text-lg">{menu.name}</span>
                  
                  {/* 수량 조절 버튼 */}
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(menu.id, -1)}
                      disabled={qty === 0}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm font-bold text-gray-600 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-lg text-gray-800">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(menu.id, 1)}
                      disabled={qty >= 2}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm font-bold text-blue-600 disabled:opacity-30"
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
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-lg"
        >
          주문 전송하기
        </button>

        {/* 내 주문 현황 */}
        <div className="mt-8 border-t pt-6">
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
                      주문완료
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
    </div>
  );
}
