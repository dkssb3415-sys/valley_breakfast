'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: number;
  created_at: string;
  table_no: string;
  menu: string;
  status: string;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [log, setLog] = useState<string>('초기화 중...');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('연결 중...');

  // 주문 목록 가져오기
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      setLog(`오류 발생: ${error.message}`);
    } else {
      setOrders(data || []);
      setLog(`불러오기 성공 (총 ${data?.length || 0}건)`);
    }
  };

  // 주문 상태 변경 (접수 -> 조리중 -> 조리완료)
  const updateOrderStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('상태 변경 실패: ' + error.message);
    }
  };

  // 주문 삭제 (완료된 주문 정리용)
  const deleteOrder = async (id: number) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      alert('삭제 실패: ' + error.message);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 실시간 구독 설정
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('실시간 이벤트:', payload);
          fetchOrders(); // 변경사항 생기면 목록 다시 불러오기
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>👨‍🍳 주방 KDS (실시간 주문 현황)</h1>
      <div style={{ background: '#f0f0f0', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px' }}>
        <b>상태 로그:</b> {log} | <b>실시간 상태:</b> {realtimeStatus}
      </div>

      <button
        onClick={fetchOrders}
        style={{ padding: '8px 16px', marginBottom: '20px', cursor: 'pointer' }}
      >
        🔄 수동 새로고침
      </button>

      <h2>주문 목록</h2>
      {orders.length === 0 ? (
        <p>현재 주문이 없습니다.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor:
                  order.status === '조리중'
                    ? '#fffbe6'
                    : order.status === '조리완료'
                    ? '#e6f7ff'
                    : '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>
                  테이블 {order.table_no}번: {order.menu}
                </h3>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor:
                      order.status === '조리중'
                        ? '#faad14'
                        : order.status === '조리완료'
                        ? '#52c41a'
                        : '#1890ff',
                  }}
                >
                  {order.status}
                </span>
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#888' }}>
                  {new Date(order.created_at).toLocaleTimeString('ko-KR')}
                </span>
              </div>

              {/* 상태 변경 버튼 모음 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {order.status === '접수' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, '조리중')}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#faad14',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    🔥 조리 시작
                  </button>
                )}
                {order.status === '조리중' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, '조리완료')}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#52c41a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    ✅ 조리 완료
                  </button>
                )}
                <button
                  onClick={() => deleteOrder(order.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
