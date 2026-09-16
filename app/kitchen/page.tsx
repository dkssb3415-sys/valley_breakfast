'use client';

import { useState, useEffect } from 'react';

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusText, setStatusText] = useState('연결 대기 중...');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 임시로 로컬 상태 기반 또는 주기적 동기화 구현 위치
    // 현재 구조에 맞춰 주문 데이터를 불러오는 로직이 있다면 이 곳에 유지됩니다.
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 상단 타이틀 및 상태 바 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              🧑‍🍳 주방 KDS (실시간 주문 현황)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              상태 로그: <span className="text-blue-600 font-medium">{statusText}</span>
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            🔄 수동 새로고침
          </button>
        </div>

        {/* 주문 목록 영역 */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">주문 목록</h2>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm text-gray-400">
            현재 주문이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <span className="text-lg font-black text-blue-600">
                      테이블 {order.table}번
                    </span>
                    <span className="text-xs text-gray-400">{order.time} 접수</span>
                  </div>

                  {/* 주문 메뉴 및 수량 리스트 */}
                  <ul className="space-y-2 mb-6">
                    {order.items.map((item: any, i: number) => (
                      <li
                        key={i}
                        className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100"
                      >
                        <span className="font-bold text-gray-800">{item.name}</span>
                        {/* 수량 강조 표시 */}
                        <span className="bg-rose-500 text-white font-black text-sm px-2.5 py-0.5 rounded-lg shadow-sm">
                          {item.quantity}개
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 조리 완료 처리 버튼 등 필요시 활용 */}
                <button
                  onClick={() => {
                    setOrders((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm text-sm"
                >
                  조리 완료 / 처리
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
