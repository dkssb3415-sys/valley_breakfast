'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchOrders();

    // Supabase Realtime 구독 설정
    const channel = supabase
      .channel('kitchen-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 모든 주문 데이터 가져오기
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('주문 목록 불러오기 실패:', error);
    } else if (data) {
      setOrders(data);
    }
  };

  // 조리 상태 변경 (조리중 ↔ 완료)
  const toggleOrderStatus = async (id: any, currentStatus: string) => {
    const nextStatus = currentStatus === '완료' ? '조리중' : '완료';

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', id);

    if (!error) {
      fetchOrders();
    }
  };

  // 주문 삭제 기능
  const deleteOrder = async (id: any) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      alert('주문 삭제 실패: ' + error.message);
    } else {
      fetchOrders();
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
            실시간 연동 활성화됨
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          🔄 수동 새로고침
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-bold text-gray-700 mb-4">접수된 주문 ({orders.length}건)</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200 shadow-sm">
            현재 접수된 주문이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const isCompleted = order.status === '완료';
              const timeStr = order.created_at
                ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '';
              
              const tableNo = order.table_number || order.table_no || order.table || '자유';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl p-5 border-2 shadow-sm transition-all flex flex-col justify-between ${
                    isCompleted ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-orange-400'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start border-b pb-3 mb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-400">{timeStr}</span>
                        <h3 className="text-xl font-black text-gray-900 mt-0.5">
                          테이블 {tableNo}번
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-orange-500 text-white animate-pulse'
                          }`}
                        >
                          {isCompleted ? '조리완료' : '조리중 🔥'}
                        </span>
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => deleteOrder(order.id)}
                          title="주문 삭제"
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors text-xs font-bold border border-transparent hover:border-red-200"
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    </div>

                    {/* 메뉴 표시 */}
                    <div className="space-y-2 mb-4">
                      {Array.isArray(order.items) ? (
                        order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-base font-bold text-gray-800">
                            <span>{typeof item === 'string' ? item : (item.name || item.menu_name)}</span>
                            <span className="text-blue-600 text-lg">{item.quantity || item.qty || 1}개</span>
                          </div>
                        ))
                      ) : order.menu ? (
                        <div className="flex justify-between items-center text-base font-bold text-gray-800">
                          <span>{order.menu}</span>
                          <span className="text-blue-600 text-lg">1개</span>
                        </div>
                      ) : (
                        <div className="text-gray-500 font-medium">
                          {JSON.stringify(order.items || order)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 하단 조리 완료/변경 버튼 */}
                  <button
                    onClick={() => toggleOrderStatus(order.id, order.status)}
                    className={`w-full py-2.5 rounded-xl font-bold transition-colors mt-2 ${
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
