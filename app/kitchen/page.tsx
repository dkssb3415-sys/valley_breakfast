'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchOrders();

    const channel = supabase
      .channel('kitchen-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
  };

  const toggleOrderStatus = async (id: any, currentStatus: string) => {
    const nextStatus = currentStatus === '완료' ? '조리중' : '완료';
    const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', id);
    if (!error) fetchOrders();
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-800">🧑‍🍳 주방 KDS (실시간 주문 현황)</h1>
        <button onClick={fetchOrders} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl">
          🔄 수동 새로고침
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-bold text-gray-700 mb-4">접수된 주문 ({orders.length}건)</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400">현재 접수된 주문이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const isCompleted = order.status === '완료';
              const tableNo = order.table_number || order.table_no || order.table || '자유';

              return (
                <div key={order.id} className={`bg-white rounded-2xl p-5 border-2 ${isCompleted ? 'border-gray-200' : 'border-orange-400'}`}>
                  <div className="flex justify-between items-start border-b pb-3 mb-3">
                    <h3 className="text-xl font-black text-gray-900">테이블 {tableNo}번</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCompleted ? 'bg-gray-200' : 'bg-orange-500 text-white'}`}>
                      {isCompleted ? '조리완료' : '조리중 🔥'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {Array.isArray(order.items) ? (
                      order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-base font-bold text-gray-800">
                          <span>{typeof item === 'string' ? item : item.name || item.menu_name}</span>
                          <span className="text-blue-600">{item.quantity || item.qty || 1}개</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-base font-bold text-gray-800">
                        <span>{order.menu || '주문 항목'}</span>
                        <span className="text-blue-600">1개</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleOrderStatus(order.id, order.status)}
                    className="w-full py-2.5 rounded-xl font-bold bg-green-600 text-white"
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
