'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchOrders();

    // Supabase Realtime 리스너 등록 (신규 주문 실시간 감지)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          // 알림음 재생
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play();
          } catch (e) {
            console.log('Audio autoplay is blocked by browser interaction policy');
          }

          setOrders((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 전체 주문 가져오기
  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
  };

  // 조리 상태 변경
  const toggleOrderStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === '완료' ? '조리중' : '완료';

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o))
      );
    }
  };

  // 전체 주문 삭제
  const clearAllOrders = async () => {
    if (confirm('모든 주문 내역을 삭제하시겠습니까?')) {
      const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (!error) setOrders([]);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            🧑‍🍳 주방 KDS (실시간 주문 현황)
          </h1>
          <p className="text-xs text-green-600 mt-1 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            Supabase 실시간 연동 활성화됨
          </p>
        </div>

        <button
          onClick={clearAllOrders}
          className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold px-4 py-2 rounded-xl border border-red-200 transition-colors"
        >
          🗑️ 전체 내역 삭제
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-bold text-gray-700 mb-4">주문 목록 ({orders.length}건)</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200 shadow-sm">
            현재 접수된 주문이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const isCompleted = order.status === '완료';
              const timeStr = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl p-5 border-2 shadow-sm transition-all ${
                    isCompleted ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-orange-400'
                  }`}
                >
                  <div className="flex justify-between items-start border-b pb-3 mb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-400">{timeStr}</span>
                      <h3 className="text-xl font-black text-gray-900 mt-0.5">
                        테이블 {order.table_number}번
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-orange-500 text-white animate-pulse'
                      }`}
                    >
                      {isCompleted ? '조리완료' : '조리중 🔥'}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {order.items?.map((item: any, i: number) => (
                      <li key={i} className="flex justify-between items-center text-base font-bold text-gray-800">
                        <span>{item.name}</span>
                        <span className="text-blue-600 text-lg">{item.quantity}개</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => toggleOrderStatus(order.id, order.status)}
                    className={`w-full py-2.5 rounded-xl font-bold transition-colors ${
                      isCompleted
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                    }`}
                  >
                    {isCompleted ? '조리중으로 변경' : '✓ 조리 완료 처리'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
