'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function OrderContent() {
  const searchParams = useSearchParams();
  const tableNo = searchParams.get('table') || '자유';

  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    '치즈 오믈렛': 0,
    팬케이크: 0,
  });
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 내 주문 목록 불러오기
  const fetchMyOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('table_number', tableNo)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMyOrders(data);
    }
  };

  useEffect(() => {
    fetchMyOrders();

    // 💡 주방에서 상태 변경(UPDATE) 시 새로고침 없이 실시간 반영
    const channel = supabase
      .channel(`table-${tableNo}-orders`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchMyOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableNo]);

  // 수량 변경 함수
  const handleQuantityChange = (menu: string, delta: number) => {
    const currentQty = quantities[menu] || 0;
    const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);

    if (delta > 0 && totalQty >= 2) {
      alert('1회 주문 시 최대 2개까지만 선택 가능합니다.');
      return;
    }

    const nextQty = Math.max(0, currentQty + delta);
    setQuantities({ ...quantities, [menu]: nextQty });
  };

  // 주문 전송 함수
  const handleSubmitOrder = async () => {
    const selectedItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([name, quantity]) => ({ name, quantity }));

    if (selectedItems.length === 0) {
      alert('최소 1개 이상의 메뉴를 선택해 주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('orders').insert([
      {
        table_number: tableNo,
        items: selectedItems,
        status: '조리중',
      },
    ]);

    setLoading(false);

    if (error) {
      console.error('주문 실패:', error);
      alert('주문 전송에 실패했습니다. 다시 시도해 주세요.');
    } else {
      // 수량 리셋 및 주문 목록 갱신
      setQuantities({ '치즈 오믈렛': 0, 팬케이크: 0 });
      setMessage('주문이 정상적으로 접수되었습니다!');
      fetchMyOrders();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md overflow-hidden p-6 border border-gray-100">
        {/* 헤더 */}
        <div className="border-b pb-4 mb-6 text-center">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
            테이블 {tableNo}번
          </span>
          <h1 className="text-2xl font-black text-gray-900 mt-2">🍳 라이브 조식 주문</h1>
        </div>

        {/* 메뉴 선택 Section */}
        <div className="space-y-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-500">메뉴 선택</h2>

          {/* 치즈 오믈렛 */}
          <div className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">치즈 오믈렛</h3>
            </div>
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
              <button
                onClick={() => handleQuantityChange('치즈 오믈렛', -1)}
                className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 rounded"
              >
                -
              </button>
              <span className="font-bold text-gray-800 w-5 text-center">
                {quantities['치즈 오믈렛']}
              </span>
              <button
                onClick={() => handleQuantityChange('치즈 오믈렛', 1)}
                className="w-7 h-7 flex items-center justify-center font-bold text-blue-600 hover:bg-blue-50 rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* 팬케이크 */}
          <div className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">팬케이크</h3>
            </div>
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
              <button
                onClick={() => handleQuantityChange('팬케이크', -1)}
                className="w-7 h-7 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-100 rounded"
              >
                -
              </button>
              <span className="font-bold text-gray-800 w-5 text-center">
                {quantities['팬케이크']}
              </span>
              <button
                onClick={() => handleQuantityChange('팬케이크', 1)}
                className="w-7 h-7 flex items-center justify-center font-bold text-blue-600 hover:bg-blue-50 rounded"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 주문 버튼 */}
        <button
          onClick={handleSubmitOrder}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors shadow-md disabled:bg-gray-300 text-lg"
        >
          {loading ? '전송 중...' : '주문 전송하기'}
        </button>

        {message && (
          <p className="text-center text-sm font-bold text-green-600 mt-3">{message}</p>
        )}

        {/* 안내 문구 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1 border border-gray-100">
          <p>• 1회 주문 시 최대 2개까지 선택 가능하며 수령 완료 후 추가 주문이 가능합니다.</p>
          <p className="text-red-500 font-semibold">• 쌀국수는 라이브 현장에서 주문 부탁드립니다.</p>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* 내 주문 현황 Section */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
            🖼️ 내 주문 현황
          </h2>

          {myOrders.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">
              아직 주문 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => {
                const isCompleted = order.status === '완료';
                const timeStr = order.created_at
                  ? new Date(order.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{timeStr} 접수</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          isCompleted
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {isCompleted ? '조리완료' : '조리중'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {Array.isArray(order.items) &&
                        order.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm font-bold text-gray-800"
                          >
                            <span>{item.name || item}</span>
                            <span className="text-gray-900">{item.quantity || 1}개</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">로딩 중...</div>}>
      <OrderContent />
    </Suspense>
  );
}
